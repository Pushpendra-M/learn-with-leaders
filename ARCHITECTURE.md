# Architecture and Design Decisions

This document outlines the architectural approach, design decisions, and trade-offs made in building this EdTech platform using React, TypeScript, and Supabase.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Schema Design](#database-schema-design)
3. [Row Level Security (RLS) Policies](#row-level-security-rls-policies)
4. [Custom JWT Authentication](#custom-jwt-authentication)
5. [Edge Functions Architecture](#edge-functions-architecture)
6. [Trade-offs and Design Decisions](#trade-offs-and-design-decisions)

## Architecture Overview

The application follows a three-tier architecture:

- **Frontend**: React 19 with TypeScript, using TanStack Query for data fetching and state management
- **Backend**: Supabase (PostgreSQL database with Row Level Security)
- **Edge Functions**: Deno-based serverless functions for complex business logic

### Key Architectural Principles

1. **Security First**: Database-level security through RLS policies
2. **Type Safety**: TypeScript throughout the stack
3. **Separation of Concerns**: Business logic in Edge Functions, data access through RLS
4. **Scalability**: Designed to handle multiple mentors per program and future growth

## Database Schema Design

### Core Tables

#### profiles
Stores user information with role-based access control. Links to Supabase Auth via foreign key to `auth.users(id)`.

**Key Design Decisions:**
- `is_approved` flag controls access for non-admin users
- Role enum constraint ensures data integrity
- Email uniqueness prevents duplicate accounts

#### programs
Educational programs with flexible mentor assignment support.

**Key Design Decisions:**
- Dual mentor assignment: `mentor_id` (legacy single mentor) and `program_mentors` junction table (multi-mentor support)
- Status field controls program visibility (draft, open, closed, completed)
- `max_students` allows capacity management

#### program_mentors
Junction table for many-to-many relationship between programs and mentors.

**Rationale:**
- Supports multiple mentors per program
- Maintains backward compatibility with `programs.mentor_id`
- Enables flexible mentor assignment without schema changes

#### applications
Student applications to programs with review workflow.

**Key Design Decisions:**
- `application_data` JSONB field for flexible application forms
- Status tracking (pending, approved, rejected)
- `reviewed_by` and `reviewed_at` for audit trail

#### enrollments
Student enrollments created automatically upon application approval.

**Key Design Decisions:**
- Simple structure: links student to program
- Created automatically by Edge Function on approval
- No status field (enrollment is binary: enrolled or not)

#### assessments
Assignments/quizzes for programs.

**Key Design Decisions:**
- `type` field supports different assessment types (quiz, assignment, project, exam)
- `max_score` for grading standardization
- `due_date` for deadline management

#### assessment_submissions
Student work submissions with grading.

**Key Design Decisions:**
- `submission_data` JSONB for flexible submission formats
- Status tracking (pending, submitted, graded)
- `graded_by` and `graded_at` for audit trail

#### assessment_answers
Stores correct answers and grading notes for assessments.

**Key Design Decisions:**
- One-to-one relationship with assessments
- `grading_notes` for mentor reference
- Separate table allows answer management without modifying assessment

### Complete Database Schema

The following SQL represents the complete database schema. Note that this is for reference only - table order and constraints may need adjustment when executing.

```sql
-- ============================================
-- DATABASE SCHEMA
-- ============================================
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.
-- ============================================

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text,
  role text NOT NULL CHECK (role = ANY (ARRAY['student'::text, 'mentor'::text, 'admin'::text])),
  created_at timestamp with time zone DEFAULT now(),
  email text UNIQUE,
  is_approved boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

CREATE TABLE public.programs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  mentor_id uuid,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  end_date date,
  max_students integer,
  start_date date,
  status text DEFAULT 'draft'::text,
  created_by uuid,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT programs_pkey PRIMARY KEY (id),
  CONSTRAINT programs_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.profiles(id),
  CONSTRAINT programs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);

CREATE TABLE public.program_mentors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL,
  mentor_id uuid NOT NULL,
  assigned_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT program_mentors_pkey PRIMARY KEY (id),
  CONSTRAINT program_mentors_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id),
  CONSTRAINT program_mentors_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.profiles(id)
);

CREATE TABLE public.applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  program_id uuid,
  student_id uuid,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  created_at timestamp with time zone DEFAULT now(),
  application_data jsonb DEFAULT '{}'::jsonb,
  submitted_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT applications_pkey PRIMARY KEY (id),
  CONSTRAINT applications_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id),
  CONSTRAINT applications_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id),
  CONSTRAINT applications_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id)
);

CREATE TABLE public.enrollments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  program_id uuid,
  student_id uuid,
  enrolled_at timestamp with time zone DEFAULT now(),
  CONSTRAINT enrollments_pkey PRIMARY KEY (id),
  CONSTRAINT enrollments_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id),
  CONSTRAINT enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id)
);

CREATE TABLE public.assessments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  due_date date,
  max_score integer,
  type text,
  CONSTRAINT assessments_pkey PRIMARY KEY (id),
  CONSTRAINT assessments_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id),
  CONSTRAINT assessments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);

CREATE TABLE public.assessment_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL,
  student_id uuid NOT NULL,
  submission_data jsonb,
  score numeric,
  submitted_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'submitted'::text, 'graded'::text])),
  CONSTRAINT assessment_submissions_pkey PRIMARY KEY (id),
  CONSTRAINT assessment_submissions_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id),
  CONSTRAINT assessment_submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id)
);

CREATE TABLE public.assessment_answers (
  assessment_id uuid NOT NULL,
  correct_answer text NOT NULL,
  grading_notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT assessment_answers_pkey PRIMARY KEY (assessment_id),
  CONSTRAINT assessment_answers_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id)
);
```

### Schema Relationships

The database schema follows these relationships:

- **profiles** (1) → (N) **programs** (via `created_by` and `mentor_id`)
- **profiles** (N) ↔ (N) **programs** (via **program_mentors** junction table)
- **profiles** (1) → (N) **applications** (via `student_id`)
- **profiles** (1) → (N) **applications** (via `reviewed_by`)
- **programs** (1) → (N) **applications**
- **programs** (1) → (N) **enrollments**
- **programs** (1) → (N) **assessments**
- **profiles** (1) → (N) **assessments** (via `created_by`)
- **assessments** (1) → (N) **assessment_submissions**
- **assessments** (1) → (1) **assessment_answers**
- **profiles** (1) → (N) **assessment_submissions** (via `student_id`)

### Key Constraints

- **Primary Keys**: All tables use UUID primary keys (except `assessment_answers` which uses `assessment_id`)
- **Foreign Keys**: All foreign keys reference `profiles(id)` or related tables
- **Check Constraints**: Status fields use CHECK constraints to enforce valid values
- **Defaults**: Timestamps default to `now()`, status fields have default values
- **Uniqueness**: `profiles.email` is UNIQUE, `assessment_answers.assessment_id` is unique (one-to-one)

## Row Level Security (RLS) Policies

RLS policies enforce security at the database level, ensuring users can only access data they're authorized to see.

### Policy Strategy

Policies are organized by role and operation type (SELECT, INSERT, UPDATE, DELETE). Some policies use `authenticated` role, others use `public` with role checks in the policy definition.

### Applications Table Policies

**Students:**
- Can INSERT their own applications
- Can SELECT their own applications
- Can DELETE their own pending applications

**Mentors:**
- Can SELECT applications for programs they're assigned to
- Can UPDATE application status for their programs

**Admins:**
- Can SELECT all applications
- Can UPDATE any application status

**Trade-off:** Some policies check both `mentor_id` and `program_mentors` table, requiring two queries. This ensures backward compatibility but adds complexity.

### Assessments Table Policies

**Students:**
- Can SELECT assessments for programs they're enrolled in

**Mentors:**
- Can SELECT assessments for their assigned programs
- Can INSERT, UPDATE, DELETE assessments for their programs

**Admins:**
- Full access (ALL operations)

**Trade-off:** Enrollment check requires join with enrollments table, adding query complexity but ensuring students only see relevant assessments.

### Assessment Submissions Policies

**Students:**
- Can INSERT their own submissions
- Can SELECT their own submissions

**Mentors:**
- Can SELECT submissions for their programs
- Can UPDATE submissions for their programs (grading)

**Admins:**
- Full access

**Trade-off:** Mentor policies require checking program assignment, which may involve multiple table joins.

### Profiles Table Policies

**Users:**
- Can INSERT their own profile
- Can SELECT their own profile
- Can UPDATE their own profile

**Admins:**
- Can SELECT all profiles
- Can UPDATE all profiles

**Trade-off:** Self-service profile management reduces admin burden but requires careful validation to prevent abuse.

### Programs Table Policies

**Students:**
- Can SELECT programs with status 'open'

**Mentors:**
- Can SELECT programs they're assigned to

**Admins:**
- Full access

**Trade-off:** Status-based filtering at database level ensures students never see draft/closed programs, but requires status field maintenance.

### Enrollments Table Policies

**Students:**
- Can SELECT their own enrollments

**Mentors:**
- Can SELECT enrollments for their programs

**Admins:**
- Can SELECT all enrollments

**Trade-off:** Read-only policies for non-admins ensure data integrity but limit flexibility for future features like enrollment management.

## Custom JWT Authentication

### Why Custom JWT?

Instead of using Supabase's built-in JWT tokens, we implemented a custom HS256 JWT system for Edge Function authentication.

### Implementation

**Frontend (`src/lib/edgeFunction/jwt.ts`):**
- Generates JWT tokens using `jose` library
- Includes user ID (`sub`) and role in token payload
- 15-minute expiration for security
- Uses shared secret (`VITE_MY_HS256_SECRET`)

**Edge Function (`supabase/functions/approve-application/index.ts`):**
- Verifies JWT using HMAC-SHA256
- Extracts user ID from token
- Validates user exists in database
- Checks profile role and approval status

### Rationale

**Advantages:**
1. **Control**: Full control over token structure and claims
2. **Performance**: Lighter tokens without Supabase metadata
3. **Flexibility**: Can add custom claims without Supabase constraints
4. **Security**: Short expiration reduces token theft impact

**Trade-offs:**
1. **Maintenance**: Must manage secret rotation and token lifecycle
2. **Complexity**: Additional code for token generation/verification
3. **Supabase Integration**: Cannot leverage Supabase's built-in token refresh

### Security Considerations

- Secret stored in environment variables
- Token expiration prevents long-lived tokens
- Role verification happens both in JWT and database (defense in depth)
- Database is source of truth for role and approval status

## Edge Functions Architecture

### Single Function Pattern

All business logic is consolidated into a single Edge Function (`approve-application`) that handles multiple actions via an `action` parameter.

### Action-Based Routing

The function uses a switch statement to route requests based on `action` parameter:

- Application management: `create_application`, `get_applications`, `get_my_applications`, `review_application`
- Enrollment management: `create_enrollment`, `get_enrollments`, `get_my_enrollments`, `get_enrollment`, `update_enrollment`
- Program management: `get_programs`, `get_my_programs`, `get_program`, `create_program`, `update_program`
- User management: `approve_user`, `update_user_role`
- Assessment management: `check_capacity`, `grade_assessment`

### Request Handling

**GET Requests:**
- Action and parameters passed as query string
- Suitable for read operations
- Cached by TanStack Query

**POST Requests:**
- Action and parameters in JSON body
- Suitable for mutations
- Not cached

### Service Role Client

Edge Function uses Supabase Service Role Key to bypass RLS policies, implementing authorization logic in the function itself.

**Rationale:**
- Complex authorization logic (e.g., mentor assignment checks) easier to implement in code
- Consistent authorization across all actions
- Better error messages and logging

**Trade-off:**
- Must re-implement authorization logic that RLS would handle
- Risk of authorization bugs if logic is incorrect
- Less declarative than RLS policies

### Application Review Workflow

The `review_application` action demonstrates the Edge Function's role:

1. Validates user permissions (admin or assigned mentor)
2. Checks application status (must be pending)
3. Updates application status
4. Creates enrollment if approved
5. Checks program capacity before enrollment
6. Rolls back application update if capacity check fails

**Trade-off:** Transaction-like behavior without database transactions, requiring careful error handling.

## Trade-offs and Design Decisions

### Database Schema Trade-offs

**Dual Mentor Assignment System:**
- **Decision**: Support both `mentor_id` and `program_mentors` table
- **Benefit**: Backward compatibility, gradual migration path
- **Cost**: More complex queries, potential data inconsistency
- **Alternative**: Single source of truth (only `program_mentors` table) - cleaner but breaking change

**Enrollment Status Field:**
- **Decision**: No status field in enrollments table
- **Benefit**: Simpler schema, enrollment is binary
- **Cost**: Cannot track enrollment states (active, completed, dropped) without schema change
- **Alternative**: Add status enum - more flexible but adds complexity

**JSONB Fields:**
- **Decision**: Use JSONB for `application_data` and `submission_data`
- **Benefit**: Flexible schema, easy to extend
- **Cost**: No type safety, harder to query, potential for inconsistent data
- **Alternative**: Structured columns - type-safe but rigid

### RLS Policy Trade-offs

**Policy Duplication:**
- **Decision**: Some policies exist in both `authenticated` and `public` contexts
- **Benefit**: Covers different access patterns
- **Cost**: Maintenance burden, potential for inconsistency
- **Alternative**: Single policy per operation - cleaner but may not cover all cases

**Mentor Assignment Checks:**
- **Decision**: Policies check both `mentor_id` and `program_mentors` table
- **Benefit**: Supports both assignment methods
- **Cost**: More complex policies, potential performance impact
- **Alternative**: Single assignment method - simpler but breaking change

### Authentication Trade-offs

**Custom JWT vs Supabase JWT:**
- **Decision**: Custom HS256 JWT for Edge Functions
- **Benefit**: Control, flexibility, lighter tokens
- **Cost**: More code, secret management, no automatic refresh
- **Alternative**: Use Supabase JWT - simpler but less control

**Role in Token vs Database:**
- **Decision**: Include role in JWT but verify against database
- **Benefit**: Performance optimization, defense in depth
- **Cost**: Token may have stale role if changed in database
- **Alternative**: Always check database - more secure but slower

### Edge Function Trade-offs

**Single Function vs Multiple Functions:**
- **Decision**: Single function with action-based routing
- **Benefit**: Easier deployment, shared code, consistent auth
- **Cost**: Larger function, potential for coupling, harder to scale independently
- **Alternative**: Separate functions per domain - better separation but more deployment complexity

**Service Role vs RLS:**
- **Decision**: Use Service Role and implement authorization in code
- **Benefit**: Complex logic, better error messages, consistent behavior
- **Cost**: Must re-implement RLS logic, risk of bugs
- **Alternative**: Use RLS everywhere - more secure but less flexible

**GET vs POST:**
- **Decision**: Use GET for read operations, POST for mutations
- **Benefit**: RESTful, caching for GET requests
- **Cost**: Query string length limits, less secure (parameters in URL)
- **Alternative**: All POST - more secure but no caching benefits

### Frontend Trade-offs

**TanStack Query Caching:**
- **Decision**: Use TanStack Query for all data fetching
- **Benefit**: Automatic caching, refetching, optimistic updates
- **Cost**: Learning curve, potential over-fetching
- **Alternative**: Manual state management - more control but more code

**Type Safety:**
- **Decision**: TypeScript throughout with strict types
- **Benefit**: Catch errors at compile time, better IDE support
- **Cost**: More verbose, type definitions maintenance
- **Alternative**: JavaScript - faster development but more runtime errors

## Performance Considerations

### Database Queries

- RLS policies add overhead to queries (additional WHERE clauses)
- Multiple mentor assignment checks require joins
- Enrollment checks require subqueries

**Mitigation:**
- Indexes on foreign keys and frequently queried fields
- Consider materialized views for complex queries
- Cache frequently accessed data in frontend

### Edge Function Performance

- Single function handles all operations (potential bottleneck)
- Authorization checks require database queries
- No connection pooling (each request creates new client)

**Mitigation:**
- Keep function lightweight
- Minimize database queries
- Consider function splitting if scale becomes issue

### Frontend Performance

- TanStack Query caching reduces API calls
- GET requests are cached automatically
- Optimistic updates improve perceived performance

**Mitigation:**
- Appropriate cache invalidation
- Pagination for large datasets
- Lazy loading for heavy components

## Security Considerations

### Defense in Depth

- RLS policies at database level
- Authorization checks in Edge Function
- Role verification in both JWT and database

### Token Security

- Short expiration (15 minutes)
- Secret stored in environment variables
- HTTPS for all communications

### Data Validation

- TypeScript types prevent invalid data structures
- Database constraints enforce data integrity
- Edge Function validates all inputs

### Audit Trail

- `reviewed_by` and `reviewed_at` fields track who reviewed applications
- `graded_by` and `graded_at` fields track who graded submissions
- `created_by` fields track resource creators

## Future Considerations

### Scalability

- Consider splitting Edge Function into domain-specific functions
- Implement pagination for large datasets
- Add database indexes based on query patterns
- Consider read replicas for heavy read workloads

### Feature Enhancements

- Add enrollment status field if needed
- Implement soft deletes for audit trail
- Add notification system for application status changes
- Implement file uploads for assessment submissions

### Technical Debt

- Consolidate mentor assignment to single method (`program_mentors` table)
- Remove duplicate RLS policies
- Standardize on single policy pattern (authenticated vs public)
- Consider database transactions for multi-step operations

## Conclusion

This architecture prioritizes security, type safety, and maintainability while making pragmatic trade-offs for development speed and flexibility. The use of RLS policies, custom JWT authentication, and Edge Functions provides a robust foundation that can scale with the application's growth.


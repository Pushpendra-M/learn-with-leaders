# EdTech Platform - Full-Stack Assignment

A React + TypeScript + Supabase application for managing educational programs, students, mentors, applications, and assessments.

## Features

- **Role-based Access Control**: Students, Mentors, and Admins with different permissions
- **Program Management**: Create and manage educational programs
- **Application System**: Students can apply to programs, mentors/admins can review
- **Enrollment Tracking**: Automatic enrollment upon application approval
- **Assessment System**: Create assessments, submit work, and grade submissions
- **Row Level Security**: Database-level security with Supabase RLS

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v7
- **UI**: Tailwind CSS with Lucide React icons

## Project Structure

```
├── src/
│   ├── components/          # Reusable components
│   │   ├── auth/           # Authentication components
│   │   └── ApplicationsReviewSection.tsx
│   ├── contexts/            # React contexts (AuthContext)
│   ├── hooks/               # Custom React hooks
│   │   ├── usePrograms.ts
│   │   ├── useApplications.ts
│   │   ├── useEnrollments.ts
│   │   ├── useAssessments.ts
│   │   └── useUserProfile.ts
│   ├── lib/                 # Library configurations
│   │   └── supabase.ts
│   ├── pages/               # Page components
│   │   ├── SignIn.tsx
│   │   ├── SignUp.tsx
│   │   ├── Home.tsx
│   │   ├── ProgramList.tsx
│   │   ├── ProgramDetail.tsx
│   │   └── AssessmentDetail.tsx
│   └── types/               # TypeScript type definitions
├── supabase/
│   ├── schema.sql          # Database schema with RLS policies
│   └── functions/          # Edge Functions
│       └── approve-application/
└── ARCHITECTURE.md          # Architecture documentation
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql` (or use the SQL below)

### Database Schema (SQL)

Ensure the following tables exist:

- `profiles`
- `programs`
- `program_mentors`
- `applications`
- `enrollments`
- `assessments`
- `assessment_submissions`

If you are not using `supabase/schema.sql`, run this in Supabase SQL Editor:

```sql
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

CREATE TABLE public.assessment_answers (
  assessment_id uuid NOT NULL,
  correct_answer text NOT NULL,
  grading_notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT assessment_answers_pkey PRIMARY KEY (assessment_id),
  CONSTRAINT assessment_answers_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id)
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
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
MY_HS256_SECRET=your-shared-hs256-secret
```

Important: This project uses a custom JWT-based auth flow for Edge Functions. The required Supabase Edge Function secret keys are `MY_HS256_SECRET` and `SUPABASE_SERVICE_ROLE_KEY`. The shared secret must match `MY_HS256_SECRET` used by the frontend.

### 4. Configure Edge Function Secrets

The `approve-application` Edge Function uses a custom HS256 JWT and requires two secrets in Supabase Edge Function secrets:

- `MY_HS256_SECRET`: Shared secret used to verify custom JWTs.
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key used by the function to access admin endpoints.

Set them in Supabase (Dashboard > Edge Functions > Secrets) or via CLI:

```bash
supabase secrets set MY_HS256_SECRET=your-shared-hs256-secret
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Use the same shared secret value for both (`MY_HS256_SECRET`) (client) and (Edge Function).

### 4. Creating Admin User (SQL)

Create the first admin user via SQL. Mentor/student users can sign up through the app UI.

```sql
-- ============================================
-- CREATE ADMIN USER
-- ============================================
-- Simple script to create an admin user
-- Prerequisites: Auto-profile trigger must be set up first
-- ============================================

DO $$
DECLARE
  new_user_id uuid;
  user_email text := 'admin1111@example.com';        -- CHANGE THIS
  user_password text := 'admin1111@example.com';    -- CHANGE THIS
  user_full_name text := 'System Administrator'; -- CHANGE THIS
BEGIN
  -- Generate new UUID
  new_user_id := gen_random_uuid();
  
  -- Create auth user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    '',
    '',
    '',
    ''
  );
  
  -- Update the auto-created profile to admin
  UPDATE public.profiles
  SET 
    full_name = user_full_name,
    role = 'admin',
    is_approved = true
  WHERE id = new_user_id;
  
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Admin user created successfully!';
  RAISE NOTICE 'Email: %', user_email;
  RAISE NOTICE 'User ID: %', new_user_id;
  RAISE NOTICE '============================================';
END $$;
```

### 5. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage

### For Students

1. Sign up or sign in
2. Browse available programs on the Programs page
3. Click on a program to view details
4. Apply to open programs by filling out the application form
5. View application status and enrollment status
6. Once enrolled, view and submit assessments
7. View grades and feedback on submitted assessments

### For Mentors

1. Sign in with a mentor account
2. View programs you're assigned to
3. Review pending applications for your programs
4. Approve or reject applications (creates enrollment on approval)
5. View assessments for your programs
6. Grade student submissions with scores and feedback

### For Admins

1. Sign in with an admin account
2. View all programs
3. Review all applications
4. Manage programs, mentors, and students
5. Create assessments for any program
6. Grade submissions

## Database Schema

### Key Tables

- **profiles**: User profiles with roles (student, mentor, admin)
- **programs**: Educational programs
- **program_mentors**: Many-to-many relationship between programs and mentors
- **applications**: Student applications to programs
- **enrollments**: Student enrollments in programs
- **assessments**: Assessments/assignments for programs
- **assessment_submissions**: Student submissions for assessments

### Row Level Security (RLS)

All tables have RLS enabled with policies for:
- **Students**: Can only view their own data and public/open programs
- **Mentors**: Can view assigned programs and their students' data
- **Admins**: Full access to all data

## Edge Functions

### `approve-application`

Handles application approval/rejection workflow:
- Validates user permissions (admin or mentor assigned to program)
- Updates application status
- Creates enrollment on approval
- Checks program capacity before enrolling

## API Documentation

### Hooks

#### `usePrograms()`
Fetch all programs (filtered by role via RLS)

#### `useProgram(id)`
Fetch a single program with mentors

#### `useMyPrograms()`
Fetch programs relevant to current user (enrolled/assigned/all based on role)

#### `useApplications(programId?)`
Fetch applications (all or for a specific program)

#### `useMyApplications()`
Fetch current user's applications

#### `useCreateApplication()`
Submit a new application

#### `useReviewApplication()`
Approve or reject an application (calls Edge Function)

#### `useEnrollments(programId?)`
Fetch enrollments

#### `useEnrollment(programId)`
Fetch enrollment for current user in a program

#### `useAssessments(programId)`
Fetch assessments for a program

#### `useAssessment(id)`
Fetch a single assessment

#### `useMySubmission(assessmentId)`
Fetch current user's submission for an assessment

#### `useAssessmentSubmissions(assessmentId)`
Fetch all submissions for an assessment (mentors/admins)

#### `useSubmitAssessment()`
Submit or update an assessment submission

#### `useGradeSubmission()`
Grade a submission (mentors/admins)

## Testing

To test the application:

1. Create test users with different roles
2. Create a program (as admin or mentor)
3. Assign mentors to programs (as admin)
4. Have students apply to programs
5. Review applications (as mentor/admin)
6. Create assessments (as mentor/admin)
7. Submit assessments (as enrolled student)
8. Grade submissions (as mentor/admin)

## Notes

- The schema includes a trigger to automatically create profiles when users sign up
- RLS policies ensure data security at the database level
- The Edge Function handles complex business logic (approval workflow)
- TanStack Query provides caching and automatic refetching
- All components are type-safe with TypeScript

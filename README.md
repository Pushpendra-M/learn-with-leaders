# EdTech Platform - Full-Stack Application

A comprehensive React + TypeScript + Supabase application for managing educational programs, students, mentors, applications, and assessments with role-based access control.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Creating Admin User](#creating-admin-user)
- [Running the Application](#running-the-application)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### Core Functionality
- **Role-based Access Control**: Three user roles (Student, Mentor, Admin) with different permissions
- **Program Management**: Create, view, and manage educational programs
- **Application System**: Students can apply to programs; mentors/admins can review and approve/reject
- **Enrollment Tracking**: Automatic enrollment creation upon application approval
- **Assessment System**: Create assessments, submit work, and grade submissions
- **User Management**: Admin panel for managing users, roles, and approvals
- **Row Level Security**: Database-level security with Supabase RLS policies

### User Roles

#### 👨‍🎓 Students
- Browse available programs
- Apply to open programs
- View application status
- Submit assessments
- View grades and feedback
- Track enrollment status

#### 👨‍🏫 Mentors
- View assigned programs
- Review applications for assigned programs
- Approve/reject applications
- Create and manage assessments
- Grade student submissions
- View student progress

#### 👨‍💼 Admins
- Full access to all features
- Manage all programs
- Review all applications
- Create and manage assessments
- User management (approve users, change roles, delete users)
- View system-wide statistics

## 🛠 Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **React Router v7** - Routing
- **TanStack Query (React Query)** - Data fetching and caching
- **Formik + Yup** - Form handling and validation
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
- **Vite** - Build tool

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL Database
  - Authentication
  - Row Level Security (RLS)
  - Edge Functions
  - Real-time subscriptions

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **Supabase CLI** - Database migrations and function deployment

## 📁 Project Structure

```
my-react-ts-app/
├── public/                      # Static assets
├── src/
│   ├── assets/                 # Images and static files
│   ├── components/             # Reusable React components
│   │   ├── auth/              # Authentication components
│   │   │   ├── AuthButton.tsx
│   │   │   ├── AuthHeader.tsx
│   │   │   ├── AuthLayout.tsx
│   │   │   ├── AuthLink.tsx
│   │   │   ├── AuthLogo.tsx
│   │   │   ├── ErrorMessage.tsx
│   │   │   ├── FormInput.tsx
│   │   │   └── SuccessMessage.tsx
│   │   ├── common/            # Common UI components
│   │   │   ├── Loading.tsx
│   │   │   └── MultiSelectAutocomplete.tsx
│   │   ├── modals/            # Modal components
│   │   │   ├── CreateAssessmentModal.tsx
│   │   │   ├── CreateProgramModal.tsx
│   │   │   └── EditProgramModal.tsx
│   │   ├── routes/            # Route protection components
│   │   │   ├── AdminOnlyRoute.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   └── sections/          # Page sections
│   │       ├── ApplicationsReviewSection.tsx
│   │       └── ProgramSubmissionsSection.tsx
│   ├── contexts/              # React contexts
│   │   └── AuthContext.tsx    # Authentication context
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAllUsers.ts
│   │   ├── useApplications.ts
│   │   ├── useApproveUser.ts
│   │   ├── useAssessmentAnswers.ts
│   │   ├── useAssessments.ts
│   │   ├── useCreateEnrollment.ts
│   │   ├── useCreateProgram.ts
│   │   ├── useDeleteUser.ts
│   │   ├── useEnrollments.ts
│   │   ├── usePrograms.ts
│   │   ├── useProgramSubmissions.ts
│   │   ├── useUpdateProgram.ts
│   │   ├── useUpdateUserRole.ts
│   │   ├── useUserProfile.ts
│   │   ├── constants.ts
│   │   └── interfaces.ts
│   ├── lib/                   # Library configurations
│   │   ├── supabase.ts        # Supabase client
│   │   └── edgeFunction/      # Edge function utilities
│   │       ├── client.ts
│   │       ├── constants.ts
│   │       ├── jwt.ts
│   │       ├── request.ts
│   │       ├── types.ts
│   │       └── utils.ts
│   ├── pages/                 # Page components
│   │   ├── admin/             # Admin pages
│   │   │   └── users/         # User management
│   │   ├── applications/      # Applications page
│   │   ├── assessments/       # Assessment pages
│   │   ├── auth/              # Authentication pages
│   │   │   ├── signin/
│   │   │   ├── signup/
│   │   │   └── waiting-approval/
│   │   ├── layout/            # Layout components
│   │   └── programs/          # Program pages
│   │       ├── create/
│   │       ├── detail/
│   │       └── list/
│   ├── routes/                # Route definitions
│   │   ├── index.tsx
│   │   └── constants.ts
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/                 # Utility functions
│   │   └── date.ts
│   ├── App.tsx                # Main app component
│   ├── App.css
│   ├── index.css
│   └── main.tsx               # Entry point
├── supabase/
│   ├── functions/             # Supabase Edge Functions
│   │   ├── approve-application/
│   │   └── program-management/
│   └── migrations/            # Database migrations
│       └── create_admin_user.sql
├── .env                       # Environment variables (create this)
├── eslint.config.js
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── README.md                  # This file
└── SUBMISSION.md              # Submission documentation
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm (or yarn/pnpm)
- **Git** for version control
- **Supabase Account** - Sign up at [supabase.com](https://supabase.com)
- **Supabase CLI** (optional, for local development)

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd my-react-ts-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned (usually 2-3 minutes)
3. Note down your project URL and anon key from Settings > API

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**Example:**
```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🗄 Database Setup

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create the necessary tables and policies (if you have a schema.sql file, run it)
4. Ensure the following tables exist:
   - `profiles`
   - `programs`
   - `program_mentors`
   - `applications`
   - `enrollments`
   - `assessments`
   - `assessment_submissions`

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI globally
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations (if you have migration files)
supabase db push
```

### Database Schema Overview

#### Key Tables

- **profiles**: User profiles with roles (student, mentor, admin) and approval status
- **programs**: Educational programs with details, dates, and capacity
- **program_mentors**: Many-to-many relationship between programs and mentors
- **applications**: Student applications to programs with status tracking
- **enrollments**: Student enrollments in programs
- **assessments**: Assessments/assignments for programs
- **assessment_submissions**: Student submissions for assessments with grading

#### Row Level Security (RLS)

All tables have RLS enabled with policies for:
- **Students**: Can only view their own data and public/open programs
- **Mentors**: Can view assigned programs and their students' data
- **Admins**: Full access to all data

## 👤 Creating Admin User

An admin user is required to manage the platform. Follow these steps to create your first admin user.

### Prerequisites

Before creating an admin user, ensure:
1. Your database schema is set up (all tables and triggers are created)
2. The auto-profile trigger is configured to create profiles automatically when users sign up
3. You have access to the Supabase SQL Editor

### Step-by-Step Instructions

1. **Open Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor** in the left sidebar
   - Click **New Query**

2. **Copy and Paste the Admin Creation Script**

   Copy the following SQL script into the SQL Editor:

```sql
-- ============================================
-- CREATE ADMIN USER
-- ============================================
-- This script creates an admin user in the auth.users table
-- and sets up the corresponding profile with admin role
-- ============================================

DO $$

DECLARE
  new_user_id uuid;
  user_email text := 'admin1111@example.com';        -- CHANGE THIS: Your admin email
  user_password text := 'admin1111@example.com';    -- CHANGE THIS: Your admin password
  user_full_name text := 'System Administrator'; -- CHANGE THIS: Admin's full name

BEGIN
  -- Generate new UUID for the user
  new_user_id := gen_random_uuid();
  
  -- Create auth user in Supabase Auth
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
  
  -- Update the auto-created profile to admin role
  -- Note: This assumes the auto-profile trigger has created a profile
  UPDATE public.profiles
  SET 
    full_name = user_full_name,
    role = 'admin',
    is_approved = true
  WHERE id = new_user_id;
  
  -- Display success message
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Admin user created successfully!';
  RAISE NOTICE 'Email: %', user_email;
  RAISE NOTICE 'User ID: %', new_user_id;
  RAISE NOTICE '============================================';
END $$;
```

3. **Update the Credentials**

   **IMPORTANT**: Before running the script, you MUST change these three variables:
   
   - `user_email`: Replace `'admin1111@example.com'` with your desired admin email address
   - `user_password`: Replace `'admin1111@example.com'` with your desired admin password
   - `user_full_name`: Replace `'System Administrator'` with the admin's full name

   Example:
   ```sql
   user_email text := 'admin@yourdomain.com';
   user_password text := 'SecurePassword123!';
   user_full_name text := 'John Doe';
   ```

4. **Run the Script**

   - Click **Run** or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)
   - Check the output panel for success messages
   - Note the User ID displayed in the output

5. **Verify Admin User**

   - Go to **Authentication > Users** in Supabase dashboard
   - Verify the new user appears in the list
   - Go to **Table Editor > profiles**
   - Verify the user's profile shows:
     - `role` = `admin`
     - `is_approved` = `true`

6. **Sign In**

   - Open your application
   - Navigate to the sign-in page
   - Use the email and password you set in the script
   - You should now have full admin access

### Alternative Method: Manual Creation

If you prefer to create the user through the Supabase dashboard:

1. **Create User via Dashboard**
   - Go to **Authentication > Users** in Supabase dashboard
   - Click **Add User** or **Invite User**
   - Enter email and password
   - Click **Create User**

2. **Update Profile to Admin**

   Run this SQL in the SQL Editor:

```sql
UPDATE public.profiles 
SET 
  role = 'admin', 
  is_approved = true,
  full_name = 'System Administrator'  -- Change this to desired name
WHERE email = 'your-admin-email@example.com';  -- Change this to the email you used
```

### Security Best Practices

- **Never use default credentials in production**
- Use a strong password (minimum 12 characters, mix of letters, numbers, and symbols)
- Store admin credentials securely
- Consider using environment variables for sensitive values
- Regularly rotate admin passwords
- Limit the number of admin users

### Troubleshooting

**Issue**: Profile not found after running script
- **Solution**: Ensure the auto-profile trigger is set up correctly. You may need to manually create the profile:

```sql
INSERT INTO public.profiles (id, email, role, is_approved, full_name)
VALUES (
  'user-id-from-output',  -- Use the User ID from the script output
  'your-admin-email@example.com',
  'admin',
  true,
  'System Administrator'
);
```

**Issue**: Cannot sign in with admin credentials
- **Solution**: Verify the email and password match what you set in the script. Check that `email_confirmed_at` is set (the script sets this automatically).

**Issue**: User created but role is not admin
- **Solution**: Run the UPDATE statement manually:

```sql
UPDATE public.profiles 
SET role = 'admin', is_approved = true 
WHERE email = 'your-admin-email@example.com';
```

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

The application will start at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## 📖 Usage Guide

### For Students

1. **Sign Up**: Create an account with email and password, select "Student" role
2. **Wait for Approval**: Your account needs admin approval before you can access the platform
3. **Browse Programs**: Once approved, view available programs on the Programs page
4. **Apply to Programs**: Click on a program to view details and submit an application
5. **Track Applications**: View your application status on the Applications page
6. **Submit Assessments**: Once enrolled, access assessments and submit your work
7. **View Grades**: Check your grades and feedback on submitted assessments

### For Mentors

1. **Sign Up**: Create an account with email and password, select "Mentor" role
2. **Wait for Approval**: Your account needs admin approval
3. **View Assigned Programs**: See programs you're assigned to as a mentor
4. **Review Applications**: Review pending applications for your programs
5. **Approve/Reject**: Approve or reject student applications (approval creates enrollment)
6. **Create Assessments**: Create assessments for your programs
7. **Grade Submissions**: Grade student submissions with scores and feedback

### For Admins

1. **Sign In**: Use your admin credentials to sign in
2. **Manage Users**: Go to Admin > Users to:
   - View all users
   - Approve/reject user accounts
   - Change user roles
   - Delete users
3. **Manage Programs**: Create, edit, and manage all programs
4. **Review Applications**: Review all applications across all programs
5. **Create Assessments**: Create assessments for any program
6. **Grade Submissions**: Grade any student submission
7. **Assign Mentors**: Assign mentors to programs

## 📚 API Documentation

### Custom Hooks

#### Authentication
- `useAuth()` - Get current user, profile, and auth methods

#### Programs
- `usePrograms()` - Fetch all programs (filtered by role via RLS)
- `useProgram(id)` - Fetch a single program with mentors
- `useMyPrograms()` - Fetch programs relevant to current user
- `useCreateProgram()` - Create a new program
- `useUpdateProgram()` - Update an existing program

#### Applications
- `useApplications(programId?)` - Fetch applications (all or for a specific program)
- `useMyApplications()` - Fetch current user's applications
- `useCreateApplication()` - Submit a new application
- `useReviewApplication()` - Approve or reject an application (calls Edge Function)

#### Enrollments
- `useEnrollments(programId?)` - Fetch enrollments
- `useEnrollment(programId)` - Fetch enrollment for current user in a program
- `useCreateEnrollment()` - Create a new enrollment

#### Assessments
- `useAssessments(programId)` - Fetch assessments for a program
- `useAssessment(id)` - Fetch a single assessment
- `useMySubmission(assessmentId)` - Fetch current user's submission for an assessment
- `useAssessmentSubmissions(assessmentId)` - Fetch all submissions for an assessment
- `useSubmitAssessment()` - Submit or update an assessment submission
- `useGradeSubmission()` - Grade a submission

#### Users
- `useAllUsers()` - Fetch all users (admin only)
- `useUserProfile(userId?)` - Fetch user profile
- `useApproveUser()` - Approve a user account
- `useUpdateUserRole()` - Update user role
- `useDeleteUser()` - Delete a user

### Edge Functions

#### `approve-application`

Handles application approval/rejection workflow:
- **Endpoint**: `/functions/v1/approve-application`
- **Method**: POST
- **Authentication**: Required (JWT token)
- **Permissions**: Admin or assigned mentor
- **Functionality**:
  - Validates user permissions
  - Updates application status
  - Creates enrollment on approval
  - Checks program capacity before enrolling

## 🏗 Architecture

### Frontend Architecture

- **Component-based**: Modular React components
- **Context API**: Global state management for authentication
- **React Query**: Server state management and caching
- **TypeScript**: Type safety throughout
- **Tailwind CSS**: Utility-first styling

### Backend Architecture

- **Supabase**: Backend-as-a-Service
- **PostgreSQL**: Relational database
- **Row Level Security**: Database-level access control
- **Edge Functions**: Serverless functions for complex operations
- **Real-time**: Built-in real-time subscriptions

### Security

- **Authentication**: Supabase Auth with JWT tokens
- **Authorization**: Role-based access control (RBAC)
- **Row Level Security**: Database-level security policies
- **Input Validation**: Form validation with Yup
- **Type Safety**: TypeScript prevents type-related errors

## 🧪 Testing

### Manual Testing Checklist

- [ ] Students can sign up and wait for approval
- [ ] Admins can approve/reject users
- [ ] Students can view and apply to programs
- [ ] Mentors can review applications for assigned programs
- [ ] Admins can review all applications
- [ ] Enrollments are created automatically on approval
- [ ] Students can submit assessments
- [ ] Mentors/Admins can grade submissions
- [ ] RLS policies enforce security correctly
- [ ] Edge Function handles approval workflow

### Testing Different Roles

1. **Create Test Users**:
   - Create users with different roles via signup or admin panel
   - Approve them via admin panel

2. **Test Student Flow**:
   - Sign in as student
   - Apply to a program
   - Submit an assessment
   - View grades

3. **Test Mentor Flow**:
   - Sign in as mentor
   - Get assigned to a program (via admin)
   - Review applications
   - Create assessments
   - Grade submissions

4. **Test Admin Flow**:
   - Sign in as admin
   - Manage users
   - Create programs
   - Assign mentors
   - Review all applications
   - Create assessments
   - Grade submissions

## 🚢 Deployment

### Frontend Deployment

#### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Add environment variables in Vercel dashboard

#### Netlify

1. Install Netlify CLI: `npm i -g netlify-cli`
2. Run: `netlify deploy --prod`
3. Add environment variables in Netlify dashboard

#### Other Platforms

1. Build the app: `npm run build`
2. Deploy the `dist/` directory to your hosting platform
3. Ensure environment variables are set

### Backend Deployment

The backend is already deployed on Supabase. Ensure:
- Edge Functions are deployed: `supabase functions deploy approve-application`
- RLS policies are active
- Database migrations are applied

### Environment Variables

Make sure to set these in your production environment:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🔧 Troubleshooting

### Common Issues

#### 1. "Missing Supabase environment variables"
- **Solution**: Create a `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

#### 2. "User not found" or Profile issues
- **Solution**: Ensure the auto-profile trigger is set up in your database
- Check that profiles are being created automatically on signup

#### 3. "Permission denied" errors
- **Solution**: Verify RLS policies are correctly set up
- Check user role and permissions
- Ensure user is approved (for non-admin users)

#### 4. Edge Function not working
- **Solution**: Ensure the function is deployed: `supabase functions deploy approve-application`
- Check function logs in Supabase dashboard
- Verify JWT token is being sent correctly

#### 5. Build errors
- **Solution**: Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run lint`
- Ensure all dependencies are installed

### Getting Help

1. Check the Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
2. Review the code comments and type definitions
3. Check browser console for errors
4. Review Supabase logs in the dashboard

## 📝 Notes

- The schema includes a trigger to automatically create profiles when users sign up
- RLS policies ensure data security at the database level
- Edge Functions handle complex business logic (approval workflow)
- TanStack Query provides caching and automatic refetching
- All components are type-safe with TypeScript
- The application uses React 19 with the latest features

## 📄 License

This is an assignment project for Learn with Leaders.

## 🙏 Acknowledgments

- Built with [React](https://react.dev/)
- Powered by [Supabase](https://supabase.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)

---

**Last Updated**: January 2025

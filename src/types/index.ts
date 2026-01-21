export type UserRole = 'student' | 'mentor' | 'admin'
export type ProgramStatus = 'draft' | 'open' | 'closed' | 'completed'
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn'
export type EnrollmentStatus = 'active' | 'completed' | 'dropped'
export type AssessmentType = 'quiz' | 'assignment' | 'project' | 'exam'
export type SubmissionStatus = 'draft' | 'submitted' | 'graded' | 'returned'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  is_approved: boolean | null
  created_at: string
  updated_at: string
}

export interface Program {
  id: string
  title: string
  description: string | null
  start_date: string | null
  end_date: string | null
  max_students: number | null
  status: ProgramStatus | null
  created_by: string | null
  created_at: string
  updated_at: string

  mentors?: Profile[]
  mentor?: Array<{
    id: string
    email: string
    full_name: string | null
  }>
  enrollments_count?: number
  applications_count?: number
  is_full?: boolean

  mentor_id?: string
  is_active?: boolean
}

export interface ProgramMentor {
  id: string
  program_id: string
  mentor_id: string
  assigned_at: string
  mentor?: Profile
}

export interface Application {
  id: string
  program_id: string
  student_id: string
  status: ApplicationStatus
  application_data: Record<string, unknown>
  submitted_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  created_at: string
  updated_at: string

  program?: Program
  student?: Profile
  reviewer?: Profile
}

export interface Enrollment {
  id: string
  program_id: string
  student_id: string
  status: EnrollmentStatus
  enrolled_at: string
  completed_at: string | null
  created_at: string
  updated_at: string

  program?: Program
  student?: Profile
}

export interface Assessment {
  id: string
  program_id: string
  title: string
  description: string | null
  type: AssessmentType
  due_date: string | null
  max_score: number
  created_by: string
  created_at: string
  updated_at: string

  program?: Program
  creator?: Profile
  submissions?: AssessmentSubmission[]
}

export interface AssessmentSubmission {
  id: string
  assessment_id: string
  student_id: string
  submission_data: Record<string, unknown>
  score: number | null
  feedback: string | null
  graded_by: string | null
  submitted_at: string | null
  graded_at: string | null
  status: SubmissionStatus
  created_at: string
  updated_at: string

  assessment?: Assessment
  student?: Profile
  grader?: Profile
}


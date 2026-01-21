export const QUERY_KEYS = {
  ALL_USERS: ['all-users'] as const,
  APPLICATIONS: ['applications'] as const,
  MY_APPLICATIONS: ['my-applications'] as const,
  APPLICATION: ['application'] as const,
  ENROLLMENTS: ['enrollments'] as const,
  MY_ENROLLMENTS: ['my-enrollments'] as const,
  ENROLLMENT: ['enrollment'] as const,
  PROGRAMS: ['programs'] as const,
  PROGRAM: ['program'] as const,
  MY_PROGRAMS: ['my-programs'] as const,
  ASSESSMENTS: ['assessments'] as const,
  ASSESSMENT: ['assessment'] as const,
  ASSESSMENT_ANSWER: ['assessment-answer'] as const,
  ASSESSMENT_SUBMISSIONS: ['assessment-submissions'] as const,
  MY_SUBMISSION: ['my-submission'] as const,
  PROGRAM_SUBMISSIONS: ['program-submissions'] as const,
  PROFILE: ['profile'] as const,
} as const

export const TABLES = {
  PROFILES: 'profiles',
  ASSESSMENTS: 'assessments',
  ASSESSMENT_SUBMISSIONS: 'assessment_submissions',
  ASSESSMENT_ANSWERS: 'assessment_answers',
  PROGRAMS: 'programs',
} as const

export const ERROR_CODES = {
  NOT_FOUND: 'PGRST116',
  DUPLICATE: '23505',
} as const

export const STALE_TIME = 5 * 60 * 1000
export const GC_TIME = 10 * 60 * 1000

export const DEFAULT_MAX_STUDENTS = 50

export const EDGE_FUNCTIONS = {
  GET_APPLICATIONS: 'get_applications',
  GET_MY_APPLICATIONS: 'get_my_applications',
  CREATE_APPLICATION: 'create_application',
  REVIEW_APPLICATION: 'review_application',
  APPROVE_USER: 'approve_user',
  CREATE_ENROLLMENT: 'create_enrollment',
  GET_ENROLLMENTS: 'get_enrollments',
  GET_MY_ENROLLMENTS: 'get_my_enrollments',
  GET_ENROLLMENT: 'get_enrollment',
  CREATE_PROGRAM: 'create_program',
  UPDATE_PROGRAM: 'update_program',
  GET_PROGRAMS: 'get_programs',
  GET_PROGRAM: 'get_program',
  GET_MY_PROGRAMS: 'get_my_programs',
  UPDATE_USER_ROLE: 'update_user_role',
} as const

export const STATUS = {
  SUBMITTED: 'submitted',
  GRADED: 'graded',
  PENDING: 'pending',
  DRAFT: 'draft',
} as const

export const SUBMISSION_STATUSES = [STATUS.SUBMITTED, STATUS.GRADED] as const

export const APPLICATION_STATUS = {
  PENDING: 'pending',
} as const

export const TEMP_ID_PREFIX = 'temp-'

export const MESSAGES = {
  NOT_AUTHENTICATED: 'Not authenticated',
  APPLICATION_SUBMITTED: 'Application submitted successfully',
  APPLICATION_REVIEWED: 'Application reviewed successfully',
  APPLICATION_NOT_FOUND: 'Application not found',
  SUBMIT_FAILED: 'Failed to submit application',
  REVIEW_FAILED: 'Failed to review application',
  USER_APPROVED: 'User approved successfully!',
  USER_APPROVE_FAILED: 'Failed to approve user',
  ASSESSMENT_ANSWERS_SAVED: 'Assessment answers saved successfully',
  ASSESSMENT_ANSWERS_UPDATED: 'Assessment answers updated successfully',
  ASSESSMENT_ANSWERS_SAVE_FAILED: 'Failed to save assessment answers',
  ASSESSMENT_ANSWERS_UPDATE_FAILED: 'Failed to update assessment answers',
  ASSESSMENT_CREATED: 'Assessment created successfully',
  ASSESSMENT_UPDATED: 'Assessment updated successfully',
  ASSESSMENT_SUBMITTED: 'Assessment submitted successfully',
  SUBMISSION_GRADED: 'Submission graded successfully',
  ALREADY_SUBMITTED: 'You have already submitted this assessment. Resubmission is not allowed.',
  ASSESSMENT_CREATE_FAILED: 'Failed to create assessment',
  ASSESSMENT_UPDATE_FAILED: 'Failed to update assessment',
  ASSESSMENT_SUBMIT_FAILED: 'Failed to submit assessment',
  ASSESSMENT_GRADE_FAILED: 'Failed to grade submission',
  ENROLLMENT_SUCCESS: 'Successfully enrolled in program!',
  ENROLLMENT_FAILED: 'Failed to enroll in program',
  PROGRAM_CREATED: 'Program created successfully!',
  PROGRAM_CREATE_FAILED: 'Failed to create program',
  PROGRAM_UPDATED: 'Program updated successfully!',
  PROGRAM_UPDATE_FAILED: 'Failed to update program',
  USER_DELETED: 'User deleted successfully!',
  USER_DELETE_FAILED: 'Failed to delete user',
  USER_ROLE_UPDATED: 'User role updated successfully!',
  USER_ROLE_UPDATE_FAILED: 'Failed to update user role',
} as const

export const REFETCH_OPTIONS = {
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
} as const

export const CONFLICT_COLUMN = 'assessment_id'


export const ROUTES = {
  SIGN_IN: '/signin',
  SIGN_UP: '/signup',
  WAITING_APPROVAL: '/waiting-approval',
  HOME: '/',
  PROGRAMS: '/programs',
  PROGRAM_DETAIL: '/programs/:id',
  ASSESSMENT_DETAIL: '/assessments/:id',
  ADMIN_USERS: '/admin/users',
  APPLICATIONS: '/applications',
  NOT_FOUND: '*',
} as const

export const getProgramDetailPath = (id: string) => `/programs/${id}`
export const getAssessmentDetailPath = (id: string) => `/assessments/${id}`


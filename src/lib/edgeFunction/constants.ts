export const EDGE_FUNCTION_NAME = 'approve-application'
export const JWT_EXPIRATION = '15m'
export const JWT_AUDIENCE = 'edge'
export const JWT_ALGORITHM = 'HS256'

export const GET_ACTIONS = [
  'get_applications',
  'get_my_applications',
  'get_enrollments',
  'get_my_enrollments',
  'get_enrollment',
  'get_programs',
  'get_my_programs',
  'get_program',
  'check_capacity',
] as const

export const MESSAGES = {
  SECRET_NOT_DEFINED: 'VITE_MY_HS256_SECRET is not defined',
  NOT_AUTHENTICATED: 'Not authenticated. Please sign in.',
  PROFILE_NOT_FOUND: 'User profile not found. Please sign in again.',
  SESSION_ERROR: 'Session error. Please sign in again.',
  EDGE_FUNCTION_FAILED: 'Failed to call Edge Function',
} as const

export const QUERY_CLIENT_CONFIG = {
  retry: 1,
  staleTime: 5 * 60 * 1000,
} as const


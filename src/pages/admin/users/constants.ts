export const ROLE_COLORS = {
  admin: 'bg-purple-100 text-purple-800',
  mentor: 'bg-blue-100 text-blue-800',
  student: 'bg-green-100 text-green-800',
  default: 'bg-gray-100 text-gray-800',
} as const

export const STATUS_COLORS = {
  approved: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
} as const

export const USER_ROLES = ['student', 'mentor', 'admin'] as const


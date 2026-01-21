import { ROLE_COLORS } from './constants'

export const getRoleBadgeColor = (role: string): string => {
  return ROLE_COLORS[role as keyof typeof ROLE_COLORS] || ROLE_COLORS.default
}

export const getRoleCounts = (users: Array<{ role: string }>) => {
  return {
    total: users.length,
    students: users.filter((u) => u.role === 'student').length,
    mentors: users.filter((u) => u.role === 'mentor').length,
    admins: users.filter((u) => u.role === 'admin').length,
  }
}


export const getRoleBadgeColor = (role?: string): string => {
  switch (role) {
    case 'admin':
      return 'bg-purple-100 text-purple-800'
    case 'mentor':
      return 'bg-blue-100 text-blue-800'
    case 'student':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}


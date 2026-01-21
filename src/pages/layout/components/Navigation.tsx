import { Link } from 'react-router-dom'
import type { Profile } from '@/types'
import { ROUTES } from '@/routes/constants'
import { getRoleBadgeColor } from '../utils'

interface NavigationProps {
  profile: Profile | null
}

export default function Navigation({ profile }: NavigationProps) {
  return (
    <>
      <Link to={ROUTES.PROGRAMS} className="text-xl font-semibold text-gray-900">
        Program Management
      </Link>
      <nav className="hidden md:flex space-x-4">
        <Link
          to={ROUTES.PROGRAMS}
          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
        >
          Programs
        </Link>
        {(profile?.role === 'admin' || profile?.role === 'mentor') && (
          <Link
            to={ROUTES.APPLICATIONS}
            className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            Applications
          </Link>
        )}
        {profile?.role === 'admin' && (
          <Link
            to={ROUTES.ADMIN_USERS}
            className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            All Users
          </Link>
        )}
      </nav>
    </>
  )
}


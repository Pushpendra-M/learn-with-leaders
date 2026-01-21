import { useNavigate } from 'react-router-dom'
import type { User, Profile } from '@/types'
import { getRoleBadgeColor } from '../utils'
import { ROUTES } from '@/routes/constants'

interface UserMenuProps {
  user: User | null
  profile: Profile | null
  onSignOut: () => void
}

export default function UserMenu({ user, profile, onSignOut }: UserMenuProps) {
  return (
    <div className="flex items-center space-x-4">
      {profile && (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(profile.role)}`}
        >
          {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
        </span>
      )}
      <span className="text-sm text-gray-700">{user?.email}</span>
      <button
        onClick={onSignOut}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Sign out
      </button>
    </div>
  )
}


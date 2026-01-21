import { Mail, Shield, CheckCircle, XCircle } from 'lucide-react'
import type { Profile } from '@/types'
import { formatDate, formatTime } from '@/utils/date'
import { getRoleBadgeColor } from '../utils'
import { STATUS_COLORS } from '../constants'
import UserActions from './UserActions'
import type { UserRole } from '@/types'

interface UserRowProps {
  user: Profile
  editingUserId: string | null
  selectedRole: UserRole
  isUpdating: boolean
  isApproving: boolean
  isDeleting: boolean
  onEditClick: (user: Profile) => void
  onRoleChange: (role: UserRole) => void
  onSaveRole: (userId: string, role: UserRole) => void
  onCancelEdit: () => void
  onApprove: (userId: string) => void
  onDeleteClick: (user: Profile) => void
}

export default function UserRow({
  user,
  editingUserId,
  selectedRole,
  isUpdating,
  isApproving,
  isDeleting,
  onEditClick,
  onRoleChange,
  onSaveRole,
  onCancelEdit,
  onApprove,
  onDeleteClick,
}: UserRowProps) {
  const getInitials = (fullName: string | null, email: string) => {
    if (fullName) {
      return fullName.charAt(0).toUpperCase()
    }
    return email.charAt(0).toUpperCase()
  }

  return (
    <tr key={user.id} className="hover:bg-gray-50">
      <td className="px-3 py-2.5">
        <div className="flex items-center min-w-0">
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-600 font-medium text-xs">
              {getInitials(user.full_name, user.email)}
            </span>
          </div>
          <div className="ml-2 min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900 truncate">
              {user.full_name || 'No name'}
            </div>
            <div className="text-xs text-gray-500 truncate">ID: {user.id.slice(0, 8)}...</div>
          </div>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center text-sm text-gray-900 min-w-0">
          <Mail className="w-3.5 h-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
          <span className="truncate">{user.email}</span>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
            user.role
          )}`}
        >
          <Shield className="w-3 h-3 mr-1" />
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </span>
      </td>
      <td className="px-3 py-2.5 text-xs text-gray-500">
        <div className="flex flex-col">
          <span>{formatDate(user.created_at)}</span>
          <span className="text-gray-400">{formatTime(user.created_at)}</span>
        </div>
      </td>
      <td className="px-3 py-2.5 text-xs text-gray-500">
        <div className="flex flex-col">
          <span>{formatDate(user.updated_at)}</span>
          <span className="text-gray-400">{formatTime(user.updated_at)}</span>
        </div>
      </td>
      <td className="px-3 py-2.5">
        {user.is_approved ? (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS.approved}`}
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        ) : (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS.pending}`}
          >
            <XCircle className="w-3 h-3 mr-1" />
            Pending
          </span>
        )}
      </td>
      <td className="px-3 py-2.5 text-sm font-medium">
        <UserActions
          user={user}
          editingUserId={editingUserId}
          selectedRole={selectedRole}
          isUpdating={isUpdating}
          isApproving={isApproving}
          isDeleting={isDeleting}
          onEditClick={onEditClick}
          onRoleChange={onRoleChange}
          onSaveRole={onSaveRole}
          onCancelEdit={onCancelEdit}
          onApprove={onApprove}
          onDeleteClick={onDeleteClick}
        />
      </td>
    </tr>
  )
}


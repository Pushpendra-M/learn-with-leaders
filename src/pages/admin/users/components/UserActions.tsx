import { Edit, CheckCircle, Trash2 } from 'lucide-react'
import type { UserRole, Profile } from '@/types'
import { USER_ROLES } from '../constants'

interface UserActionsProps {
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

export default function UserActions({
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
}: UserActionsProps) {
  const isEditing = editingUserId === user.id

  return (
    <div className="flex items-center gap-1.5">
      {isEditing ? (
        <div className="flex items-center gap-1 flex-wrap">
          <select
            value={selectedRole}
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
            className="px-1.5 py-0.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {USER_ROLES.map((role) => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
          <button
            onClick={() => onSaveRole(user.id, selectedRole)}
            disabled={isUpdating}
            className="px-1.5 py-0.5 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={onCancelEdit}
            className="px-1.5 py-0.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <button
            onClick={() => onEditClick(user)}
            className="p-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded"
            title="Change Role"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          {!user.is_approved && (
            <button
              onClick={() => onApprove(user.id)}
              disabled={isApproving}
              className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded disabled:opacity-50"
              title="Approve User"
            >
              <CheckCircle className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => onDeleteClick(user)}
            disabled={isDeleting}
            className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded disabled:opacity-50"
            title="Delete User"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </div>
  )
}


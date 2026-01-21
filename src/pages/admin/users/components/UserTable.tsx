import type { Profile, UserRole } from '@/types'
import UserRow from './UserRow'
import UserStats from './UserStats'
import { getRoleCounts } from '../utils'

interface UserTableProps {
  users: Profile[]
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

export default function UserTable({
  users,
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
}: UserTableProps) {
  const roleCounts = getRoleCounts(users)

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full min-h-0">
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full divide-y divide-gray-200 table-fixed min-w-full">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="w-[200px] px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="w-[220px] px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="w-[100px] px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="w-[140px] px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="w-[140px] px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Updated
              </th>
              <th className="w-[130px] px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="w-[120px] px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <UserRow
                key={user.id}
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
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex-shrink-0">
      <UserStats {...roleCounts} />
      </div>
    </div>
  )
}


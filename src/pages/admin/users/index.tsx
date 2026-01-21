import { useState } from 'react'
import { Users } from 'lucide-react'
import { useAllUsers } from '@/hooks/useAllUsers'
import { useUpdateUserRole } from '@/hooks/useUpdateUserRole'
import { useDeleteUser } from '@/hooks/useDeleteUser'
import { useApproveUser } from '@/hooks/useApproveUser'
import type { UserRole, Profile } from '@/types'
import UserTable from './components/UserTable'
import DeleteUserModal from './components/DeleteUserModal'
import Loading from '@/components/common/Loading'

export default function AdminUsers() {
  const { data: users, isLoading, error } = useAllUsers()
  const updateRole = useUpdateUserRole()
  const deleteUser = useDeleteUser()
  const approveUser = useApproveUser()
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<UserRole>('student')
  const [userToDelete, setUserToDelete] = useState<Profile | null>(null)

  const handleUpdateRole = async (userId: string, role: UserRole) => {
    await updateRole.mutateAsync({ userId, role })
    setEditingUserId(null)
  }

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      await deleteUser.mutateAsync(userToDelete.id)
      setUserToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setUserToDelete(null)
  }

  if (isLoading) {
    return <Loading loading={true} />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Error loading users</p>
          <p className="text-gray-500 text-sm mt-2">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 h-full flex flex-col">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">All Users</h1>
          </div>
          <p className="text-gray-600">Manage all registered users in the system</p>
        </div>

        <div className="flex-1 min-h-0">
        {users && users.length > 0 ? (
          <UserTable
            users={users}
            editingUserId={editingUserId}
            selectedRole={selectedRole}
            isUpdating={updateRole.isPending}
            isApproving={approveUser.isPending}
            isDeleting={deleteUser.isPending}
            onEditClick={(user) => {
              setEditingUserId(user.id)
              setSelectedRole(user.role)
            }}
            onRoleChange={setSelectedRole}
            onSaveRole={handleUpdateRole}
            onCancelEdit={() => setEditingUserId(null)}
            onApprove={(userId) => approveUser.mutateAsync(userId)}
            onDeleteClick={setUserToDelete}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No users found.</p>
          </div>
        )}
        </div>
      </div>

      <DeleteUserModal
        user={userToDelete}
        isPending={deleteUser.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  )
}


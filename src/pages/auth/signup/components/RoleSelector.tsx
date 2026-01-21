import type { UserRole } from '@/types'

interface RoleSelectorProps {
  role: UserRole
  onRoleChange: (role: UserRole) => void
}

export default function RoleSelector({ role, onRoleChange }: RoleSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">I am a:</label>
      <div className="flex gap-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="role"
            value="student"
            checked={role === 'student'}
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
          />
          <span className="text-sm text-gray-700">Student</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="role"
            value="mentor"
            checked={role === 'mentor'}
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
          />
          <span className="text-sm text-gray-700">Mentor</span>
        </label>
      </div>
    </div>
  )
}


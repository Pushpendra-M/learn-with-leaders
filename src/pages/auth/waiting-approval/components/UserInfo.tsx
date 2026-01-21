import { Mail, User } from 'lucide-react'
import type { Profile } from '@/types'

interface UserInfoProps {
  profile: Profile
}

export default function UserInfo({ profile }: UserInfoProps) {
  const getInitials = (fullName: string | null, email: string) => {
    if (fullName) {
      return fullName.charAt(0).toUpperCase()
    }
    return email.charAt(0).toUpperCase()
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
          <span className="text-indigo-600 font-medium">
            {getInitials(profile.full_name, profile.email)}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{profile.full_name || 'No name'}</p>
          <p className="text-xs text-gray-500 capitalize">{profile.role}</p>
        </div>
      </div>
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-400" />
          <span>{profile.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="capitalize">{profile.role}</span>
        </div>
      </div>
    </div>
  )
}


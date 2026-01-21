import type { Profile } from '@/types'
import { getInitials } from '../utils'

interface MentorDisplayProps {
  mentors: Profile[]
  programId: string
  expandedMentors: Set<string>
  onToggleExpand: (programId: string) => void
}

export default function MentorDisplay({
  mentors,
  programId,
  expandedMentors,
  onToggleExpand,
}: MentorDisplayProps) {
  if (mentors.length === 0) {
    return <span className="text-sm text-gray-400">Not assigned</span>
  }

  if (mentors.length === 1) {
    const mentor = mentors[0]
    return (
      <div className="flex items-center gap-2">
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
          <span className="text-xs font-medium text-indigo-700">
            {getInitials(mentor.full_name, mentor.email)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {mentor.full_name || mentor.email?.split('@')[0] || 'Unknown'}
          </span>
          <span className="text-xs text-gray-500">{mentor.email || ''}</span>
        </div>
      </div>
    )
  }

  const isExpanded = expandedMentors.has(programId)

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {mentors.slice(0, 3).map((mentor, idx) => (
            <div
              key={mentor.id || idx}
              className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center"
              title={mentor.full_name || mentor.email || ''}
            >
              <span className="text-xs font-medium text-indigo-700">
                {getInitials(mentor.full_name, mentor.email)}
              </span>
            </div>
          ))}
          {mentors.length > 3 && (
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">+{mentors.length - 3}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {mentors.length} mentor{mentors.length > 1 ? 's' : ''}
          </span>
          <button
            onClick={() => onToggleExpand(programId)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium text-left"
          >
            {isExpanded ? 'Show less' : 'View all'}
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
          {mentors.map((mentor, index) => (
            <div key={mentor.id || index} className="flex items-center gap-2">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-xs font-medium text-indigo-700">
                  {getInitials(mentor.full_name, mentor.email)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {mentor.full_name || mentor.email?.split('@')[0] || 'Unknown'}
                </span>
                <span className="text-xs text-gray-500">{mentor.email || ''}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


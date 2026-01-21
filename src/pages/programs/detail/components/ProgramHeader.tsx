import { ArrowLeft, Calendar, Users, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { formatDateShort } from '@/utils/date'
import { ROUTES, getProgramDetailPath } from '@/routes/constants'
import type { Program } from '@/types'

interface ProgramHeaderProps {
  program: Program
}

export default function ProgramHeader({ program }: ProgramHeaderProps) {
  const navigate = useNavigate()
  const { profile } = useAuth()

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <>
      <button
        onClick={() => navigate(ROUTES.PROGRAMS)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Programs
      </button>

      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{program.title}</h1>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                program.status
              )}`}
            >
              {program.status
                ? program.status.charAt(0).toUpperCase() + program.status.slice(1)
                : 'Draft'}
            </span>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-5 h-5 mr-3" />
            <span>
              {formatDateShort(program.start_date)} - {formatDateShort(program.end_date)}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="w-5 h-5 mr-3" />
            <div className="flex flex-col">
              <span>
                {program.enrollments_count !== undefined
                  ? `${program.enrollments_count} student${program.enrollments_count !== 1 ? 's' : ''} enrolled`
                  : '0 students enrolled'}
              </span>
              <span className="text-sm text-gray-500">
                {program.max_students
                  ? `Maximum ${program.max_students} students`
                  : 'Unlimited capacity'}
              </span>
            </div>
          </div>
          {profile?.role === 'admin' && (
            <div className="flex items-center text-gray-600">
              <User className="w-5 h-5 mr-3" />
              <div className="flex flex-col">
                <span className="font-medium">Assigned Mentor{program.mentors && program.mentors.length > 1 ? 's' : ''}:</span>
                {program.mentors && program.mentors.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {program.mentors.map((mentor) => (
                      <span key={mentor.id} className="text-sm text-gray-700">
                        {mentor.full_name || mentor.email}
                      </span>
                    ))}
                  </div>
                ) : program.mentor && Array.isArray(program.mentor) && program.mentor.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {program.mentor.map((mentor, index) => (
                      <span key={mentor.id || index} className="text-sm text-gray-700">
                        {mentor.full_name || mentor.email}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">Not assigned</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="prose max-w-none mb-6">
          <p className="text-gray-700 whitespace-pre-wrap">
            {program.description || 'No description available.'}
          </p>
        </div>
      </div>
    </>
  )
}


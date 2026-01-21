import { Link } from 'react-router-dom'
import { Calendar, Users, Eye, Edit, UserPlus } from 'lucide-react'
import type { Program, Application } from '@/types'
import { formatProgramDate, getStudentStatusLabel } from '../utils'
import { PROGRAM_STATUS_COLORS, STUDENT_STATUS_COLORS } from '../constants'
import { getProgramDetailPath } from '@/routes/constants'

interface ProgramRowProps {
  program: Program
  profile: { role?: string } | null
  programStatus: { type: 'enrolled' } | { type: 'applied'; status: string } | { type: 'available'; status: null }
  application: Application | undefined
  enrollingProgramId: string | null
  isEnrolling: boolean
  onEnroll: (programId: string) => void
  onEdit: (program: Program) => void
}

export default function ProgramRow({
  program,
  profile,
  programStatus,
  application,
  enrollingProgramId,
  isEnrolling,
  onEnroll,
  onEdit,
}: ProgramRowProps) {
  const getStatusBadgeColor = (status: string | null): string => {
    if (!status) return PROGRAM_STATUS_COLORS.default
    return PROGRAM_STATUS_COLORS[status as keyof typeof PROGRAM_STATUS_COLORS] || PROGRAM_STATUS_COLORS.default
  }

  const getStudentStatusBadgeColor = (programStatus: ProgramRowProps['programStatus']): string => {
    if (programStatus.type === 'enrolled') {
      return STUDENT_STATUS_COLORS.enrolled
    }
    if (programStatus.type === 'applied') {
      if (programStatus.status === 'pending') {
        return 'bg-yellow-100 text-yellow-800'
      }
      if (programStatus.status === 'approved') {
        return 'bg-green-100 text-green-800'
      }
      if (programStatus.status === 'rejected') {
        return 'bg-red-100 text-red-800'
      }
      return STUDENT_STATUS_COLORS.applied
    }
    return STUDENT_STATUS_COLORS.available
  }

  const getDisplayStatus = () => {
    if (profile?.role === 'student') {
      const statusLabel = getStudentStatusLabel(programStatus, application, program)
      return {
        label: statusLabel,
        color: getStudentStatusBadgeColor(programStatus),
      }
    }
    return {
      label: program.status ? program.status.charAt(0).toUpperCase() + program.status.slice(1) : 'Draft',
      color: getStatusBadgeColor(program.status),
    }
  }

  const displayStatus = getDisplayStatus()

  const canEnroll =
    profile?.role === 'student' &&
    programStatus.type === 'available' &&
    program.status === 'open' &&
    !(program.max_students && (program.enrollments_count || 0) >= program.max_students)

  return (
    <tr key={program.id} className="hover:bg-gray-50">
      <td className="px-3 sm:px-6 py-3 sm:py-4">
        <div>
          <div className="text-sm font-medium text-gray-900">{program.title}</div>
          <div className="text-xs sm:text-sm text-gray-500 line-clamp-1 mt-1">
            {program.description || 'No description'}
          </div>
          {profile?.role === 'student' && (
            <div className="mt-2 sm:hidden">
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${displayStatus.color}`}>
                {displayStatus.label}
              </span>
            </div>
          )}
          {profile?.role !== 'student' && (
            <div className="mt-2 sm:hidden">
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                  program.status
                )}`}
              >
                {program.status
                  ? program.status.charAt(0).toUpperCase() + program.status.slice(1)
                  : 'Draft'}
              </span>
            </div>
          )}
          <div className="mt-2 md:hidden text-xs text-gray-500">
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1 text-gray-400" />
              <span>
                {formatProgramDate(program.start_date)} - {formatProgramDate(program.end_date)}
              </span>
            </div>
          </div>
        </div>
      </td>
      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${displayStatus.color}`}>
          {displayStatus.label}
        </span>
      </td>
      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
          <div>
            <div>{formatProgramDate(program.start_date)}</div>
            <div className="text-xs">to {formatProgramDate(program.end_date)}</div>
          </div>
        </div>
      </td>
      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-2 text-gray-400" />
          <div className="flex flex-col">
            <span>
              {program.enrollments_count !== undefined
                ? `${program.enrollments_count} enrolled`
                : '0 enrolled'}
            </span>
            <span className="text-xs text-gray-400">
              {program.max_students ? `Max ${program.max_students}` : 'Unlimited'}
            </span>
          </div>
        </div>
      </td>
      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          <Link
            to={getProgramDetailPath(program.id)}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-900 text-xs sm:text-sm"
          >
            <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            View
          </Link>
          {profile?.role === 'admin' && (
            <button
              onClick={() => onEdit(program)}
              className="inline-flex items-center text-indigo-600 hover:text-indigo-900 text-xs sm:text-sm"
            >
              <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Edit
            </button>
          )}
          {canEnroll && (
            <button
              onClick={() => onEnroll(program.id)}
              disabled={enrollingProgramId === program.id && isEnrolling}
              className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              {enrollingProgramId === program.id && isEnrolling ? 'Enrolling...' : 'Enroll'}
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}


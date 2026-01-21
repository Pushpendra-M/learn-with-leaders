import { Calendar, Users } from 'lucide-react'
import type { Program, Application, Enrollment } from '@/types'
import ProgramRow from './ProgramRow'
import { getProgramStatus } from '../utils'

interface ProgramTableProps {
  programs: Program[]
  profile: { role?: string } | null
  enrollmentMap: Map<string, Enrollment>
  applicationMap: Map<string, Application>
  enrollingProgramId: string | null
  isEnrolling: boolean
  onEnroll: (programId: string) => void
  onEdit: (program: Program) => void
}

export default function ProgramTable({
  programs,
  profile,
  enrollmentMap,
  applicationMap,
  enrollingProgramId,
  isEnrolling,
  onEnroll,
  onEdit,
}: ProgramTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex-1 flex flex-col min-h-0 h-full">
      <div className="flex-1 min-h-0 overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Program
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 hidden sm:table-cell">
                  {profile?.role === 'student' ? 'Your Status' : 'Status'}
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 hidden md:table-cell">
                  Dates
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 hidden lg:table-cell">
                  Capacity
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {programs.map((program) => {
                const programStatus = getProgramStatus(program.id, enrollmentMap, applicationMap)
                const application = applicationMap.get(program.id)

                return (
                  <ProgramRow
                    key={program.id}
                    program={program}
                    profile={profile}
                    programStatus={programStatus}
                    application={application}
                    enrollingProgramId={enrollingProgramId}
                    isEnrolling={isEnrolling}
                    onEnroll={onEnroll}
                    onEdit={onEdit}
                  />
                )
              })}
            </tbody>
          </table>
      </div>

      <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex-shrink-0">
        <div className="text-xs sm:text-sm text-gray-700">
          <span className="font-medium">Total Programs:</span> {programs.length}
        </div>
      </div>
    </div>
  )
}


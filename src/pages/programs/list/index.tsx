import { useState, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePrograms, useMyPrograms } from '@/hooks/usePrograms'
import { useMyApplications } from '@/hooks/useApplications'
import { useMyEnrollments } from '@/hooks/useEnrollments'
import { useCreateEnrollment } from '@/hooks/useCreateEnrollment'
import CreateProgramModal from '@/components/modals/CreateProgramModal'
import EditProgramModal from '@/components/modals/EditProgramModal'
import { Plus } from 'lucide-react'
import Loading from '@/components/common/Loading'
import ProgramTable from './components/ProgramTable'
import { filterProgramsForStudent } from './utils'
import type { Program, Application, Enrollment } from '@/types'

export default function ProgramList() {
  const { profile } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)
  const [enrollingProgramId, setEnrollingProgramId] = useState<string | null>(null)

  const { data: allPrograms, isLoading: isLoadingPrograms } = usePrograms(undefined, {
    enabled: profile?.role === 'admin' || profile?.role === 'student',
  })
  const { data: myPrograms, isLoading: isLoadingMyPrograms } = useMyPrograms({
    enabled: profile?.role === 'mentor',
  })
  const { data: myApplications } = useMyApplications({
    enabled: profile?.role === 'student',
  })
  const { data: myEnrollments } = useMyEnrollments({
    enabled: profile?.role === 'student',
  })
  const { mutate: createEnrollment, isPending: isEnrolling } = useCreateEnrollment()

  const isLoading = profile?.role === 'mentor' ? isLoadingMyPrograms : isLoadingPrograms

  const programs = useMemo(() => {
    if (profile?.role === 'student') {
      return filterProgramsForStudent(allPrograms || [])
    }
    if (profile?.role === 'admin') {
      return allPrograms || []
    }
    if (profile?.role === 'mentor') {
      return myPrograms || []
    }
    return []
  }, [allPrograms, myPrograms, profile?.role])

  const enrollmentMap = useMemo(() => {
    const map = new Map<string, Enrollment>()
    myEnrollments?.forEach((enrollment) => {
      map.set(enrollment.program_id, enrollment)
    })
    return map
  }, [myEnrollments])

  const applicationMap = useMemo(() => {
    const map = new Map<string, Application>()
    myApplications?.forEach((application) => {
      map.set(application.program_id, application)
    })
    return map
  }, [myApplications])

  const handleEnroll = (programId: string) => {
    setEnrollingProgramId(programId)
    createEnrollment(programId, {
      onSuccess: () => {
        setEnrollingProgramId(null)
      },
      onError: () => {
        setEnrollingProgramId(null)
      },
    })
  }

  const handleEdit = (program: Program) => {
    setEditingProgram(program)
  }

  if (isLoading) {
    return <Loading loading={true} />
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 h-full flex flex-col min-h-0">
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Programs</h1>
            <p className="mt-1 text-sm text-gray-500">
              {profile?.role === 'admin'
                ? 'Manage all programs'
                : profile?.role === 'mentor'
                ? 'Programs assigned to you'
                : 'Browse available programs'}
            </p>
          </div>
          {profile?.role === 'admin' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Program
            </button>
          )}
        </div>

        <div className="flex-1 min-h-0">
          {programs && programs.length > 0 ? (
          <ProgramTable
            programs={programs}
            profile={profile}
            enrollmentMap={enrollmentMap}
            applicationMap={applicationMap}
            enrollingProgramId={enrollingProgramId}
            isEnrolling={isEnrolling}
            onEnroll={handleEnroll}
            onEdit={handleEdit}
          />
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500">No programs available</p>
            </div>
          )}
        </div>
      </div>

      <CreateProgramModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <EditProgramModal
        isOpen={!!editingProgram}
        onClose={() => setEditingProgram(null)}
        program={editingProgram}
      />
    </div>
  )
}


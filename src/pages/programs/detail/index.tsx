import { useParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useProgram } from '@/hooks/usePrograms'
import { useMyApplications, useApplications } from '@/hooks/useApplications'
import { useEnrollment } from '@/hooks/useEnrollments'
import { useCreateEnrollment } from '@/hooks/useCreateEnrollment'
import { useAssessments } from '@/hooks/useAssessments'
import { useProgramSubmissions } from '@/hooks/useProgramSubmissions'
import ApplicationsReviewSection from '@/components/sections/ApplicationsReviewSection'
import ProgramSubmissionsSection from '@/components/sections/ProgramSubmissionsSection'
import CreateAssessmentModal from '@/components/modals/CreateAssessmentModal'
import Loading from '@/components/common/Loading'
import ProgramHeader from './components/ProgramHeader'
import StudentEnrollmentSection from './components/StudentEnrollmentSection'
import AssessmentsSection from './components/AssessmentsSection'
import type { Assessment, Application } from '@/types'
import { useState, useMemo } from 'react'

export default function ProgramDetail() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()
  const { data: program, isLoading: programLoading } = useProgram(id || '')
  const { data: enrollment } = useEnrollment(id || '', undefined, {
    enabled: profile?.role === 'student' && !!id,
  })
  const { data: myApplications } = useMyApplications({
    enabled: profile?.role === 'student',
  })
  const createEnrollment = useCreateEnrollment()

  const [showAssessmentModal, setShowAssessmentModal] = useState(false)
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null)

  const application = useMemo(() => {
    return myApplications?.find((app: Application) => app.program_id === id) || null
  }, [myApplications, id])

  const isEnrolled = !!enrollment
  const shouldLoadAssessments =
    isEnrolled || profile?.role === 'mentor' || profile?.role === 'admin'

  const { data: assessments } = useAssessments(id || '', {
    enabled: shouldLoadAssessments && !!id,
  })

  const { data: applications } = useApplications(id || '')

  const { data: submissions } = useProgramSubmissions(id || '', {
    enabled: (profile?.role === 'admin' || profile?.role === 'mentor') && !!id,
  })

  const handleEnroll = async () => {
    if (!id) return
    await createEnrollment.mutateAsync(id)
  }

  if (programLoading) {
    return <Loading loading={true} />
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Program not found.</p>
        </div>
      </div>
    )
  }

  const isFull = program.max_students
    ? (program.enrollments_count || 0) >= program.max_students
    : false
  const canApply =
    profile?.role === 'student' &&
    !enrollment &&
    !application &&
    (program.status === 'open' || !program.status) &&
    !isFull

  const hasStudentData = profile?.role === 'student' && (isEnrolled || application || canApply)
  const hasAdminMentorData = (profile?.role === 'admin' || profile?.role === 'mentor') && 
    ((applications && applications.length > 0) ||
     (submissions && submissions.length > 0))
  const shouldShowDiv = hasStudentData || hasAdminMentorData

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <ProgramHeader program={program} />

        {shouldShowDiv && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            {profile?.role === 'student' && (
              <div className="border-t pt-6 mt-6">
                <StudentEnrollmentSection
                  isEnrolled={isEnrolled}
                  application={application}
                  canApply={canApply}
                  isEnrolling={createEnrollment.isPending}
                  onEnroll={handleEnroll}
                />
              </div>
            )}

            {(profile?.role === 'admin' || profile?.role === 'mentor') && (
              <>
                <ApplicationsReviewSection programId={id || ''} />
                <ProgramSubmissionsSection programId={id || ''} />
              </>
            )}
          </div>
        )}

        {shouldLoadAssessments && (
          <>
            <AssessmentsSection
              assessments={assessments}
              canCreate={profile?.role === 'mentor' || profile?.role === 'admin'}
              canEdit={profile?.role === 'mentor' || profile?.role === 'admin'}
              onCreateClick={() => {
                setEditingAssessment(null)
                setShowAssessmentModal(true)
              }}
              onEditClick={(assessment) => {
                setEditingAssessment(assessment)
                setShowAssessmentModal(true)
              }}
            />

            {showAssessmentModal && (
              <CreateAssessmentModal
                isOpen={showAssessmentModal}
                onClose={() => {
                  setShowAssessmentModal(false)
                  setEditingAssessment(null)
                }}
                programId={id || ''}
                assessment={editingAssessment}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}


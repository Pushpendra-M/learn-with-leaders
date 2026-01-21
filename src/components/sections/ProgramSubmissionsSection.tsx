import { useProgramSubmissions } from '@/hooks/useProgramSubmissions'
import { useAssessments } from '@/hooks/useAssessments'
import { useEnrollments } from '@/hooks/useEnrollments'
import { CheckCircle, Clock, User, Mail, FileText } from 'lucide-react'
import { useMemo } from 'react'
import type { AssessmentSubmission } from '@/types'

interface ProgramSubmissionsSectionProps {
  programId: string
}

export default function ProgramSubmissionsSection({ programId }: ProgramSubmissionsSectionProps) {
  const { data: submissions } = useProgramSubmissions(programId, {
    enabled: !!programId,
  })
  const { data: assessments } = useAssessments(programId, {
    enabled: !!programId,
  })
  const { data: enrollments } = useEnrollments(programId)

  // Group submissions by student
  const submissionsByStudent = useMemo(() => {
    if (!submissions || !assessments) return new Map()

    const studentMap = new Map<string, {
      student: { id: string; email: string; full_name: string | null }
      submissions: AssessmentSubmission[]
      completedCount: number
      totalAssessments: number
    }>()

    // Initialize map with all enrolled students
    enrollments?.forEach((enrollment) => {
      if (enrollment.student) {
        studentMap.set(enrollment.student.id, {
          student: {
            id: enrollment.student.id,
            email: enrollment.student.email,
            full_name: enrollment.student.full_name,
          },
          submissions: [],
          completedCount: 0,
          totalAssessments: assessments.length,
        })
      }
    })

    // Add submissions to the map
    submissions.forEach((submission) => {
      if (submission.student) {
        const studentId = submission.student.id
        if (!studentMap.has(studentId)) {
          studentMap.set(studentId, {
            student: {
              id: submission.student.id,
              email: submission.student.email,
              full_name: submission.student.full_name,
            },
            submissions: [],
            completedCount: 0,
            totalAssessments: assessments.length,
          })
        }
        const studentData = studentMap.get(studentId)!
        studentData.submissions.push(submission)
        if (submission.status === 'submitted' || submission.status === 'graded') {
          studentData.completedCount++
        }
      }
    })

    return studentMap
  }, [submissions, assessments, enrollments])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not submitted'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }


  const studentsArray = Array.from(submissionsByStudent.values())

  // Don't show section if no enrolled students
  if (!enrollments || enrollments.length === 0) {
    return null
  }

  // Don't show section if no submissions exist
  if (!submissions || submissions.length === 0) {
    return null
  }

  // Filter to only show students who have submissions
  const studentsWithSubmissions = studentsArray.filter(
    ({ submissions: studentSubmissions }) => studentSubmissions.length > 0
  )

  // Don't show section if no students have submissions
  if (studentsWithSubmissions.length === 0) {
    return null
  }

  return (
    <div className="pt-6 mt-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5" />
        Student Submissions ({studentsWithSubmissions.length} {studentsWithSubmissions.length === 1 ? 'student' : 'students'})
      </h3>
      <div className="space-y-4">
        {studentsWithSubmissions.map(({ student, submissions: studentSubmissions, completedCount, totalAssessments }) => {
          const completionPercentage = totalAssessments > 0 
            ? Math.round((completedCount / totalAssessments) * 100)
            : 0

          return (
            <div key={student.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {student.full_name || student.email?.split('@')[0] || 'Unknown Student'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-3 h-3 text-gray-400" />
                      <span className="text-sm text-gray-500">{student.email}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    {completedCount === totalAssessments && totalAssessments > 0 ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-600" />
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {completedCount} / {totalAssessments} completed
                    </span>
                  </div>
                  <div className="mt-1">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          completionPercentage === 100
                            ? 'bg-green-600'
                            : completionPercentage > 0
                            ? 'bg-yellow-500'
                            : 'bg-gray-300'
                        }`}
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {studentSubmissions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Submitted Assessments:</p>
                  <div className="space-y-2">
                    {studentSubmissions.map((submission: AssessmentSubmission) => (
                      <div
                        key={submission.id}
                        className="flex items-center justify-between bg-white rounded-md p-2 border border-gray-200"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {submission.assessment?.title || 'Unknown Assessment'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              submission.status === 'graded'
                                ? 'bg-green-100 text-green-800'
                                : submission.status === 'submitted'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {submission.status === 'graded' ? 'Graded' : 'Submitted'}
                          </span>
                          {submission.status === 'graded' && submission.score !== null && (
                            <span className="text-sm font-medium text-gray-700">
                              Score: {submission.score}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatDate(submission.submitted_at)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}


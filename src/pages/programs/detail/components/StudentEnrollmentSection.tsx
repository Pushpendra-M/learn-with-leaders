import { CheckCircle, XCircle, Clock, UserPlus } from 'lucide-react'
import type { Application } from '@/types'

interface StudentEnrollmentSectionProps {
  isEnrolled: boolean
  application: Application | null
  canApply: boolean
  isEnrolling: boolean
  onEnroll: () => void
}

export default function StudentEnrollmentSection({
  isEnrolled,
  application,
  canApply,
  isEnrolling,
  onEnroll,
}: StudentEnrollmentSectionProps) {
  if (isEnrolled) {
    return (
      <div className="flex items-center text-green-600">
        <CheckCircle className="w-5 h-5 mr-2" />
        <span className="font-medium">You are enrolled in this program</span>
      </div>
    )
  }

  if (application) {
    return (
      <div className="space-y-4">
        {application.status === 'pending' && (
          <div className="flex items-center text-yellow-600">
            <Clock className="w-5 h-5 mr-2" />
            <span className="font-medium">Application Approval Pending</span>
          </div>
        )}
        {application.status === 'approved' && (
          <div className="flex items-center text-green-600">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Your application has been approved!</span>
          </div>
        )}
        {application.status === 'rejected' && (
          <div className="flex items-center text-red-600">
            <XCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Your application was not approved</span>
          </div>
        )}
      </div>
    )
  }

  if (canApply) {
    return (
      <button
        onClick={onEnroll}
        disabled={isEnrolling}
        className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <UserPlus className="w-5 h-5 mr-2" />
        {isEnrolling ? 'Enrolling...' : 'Enroll'}
      </button>
    )
  }

  return null
}


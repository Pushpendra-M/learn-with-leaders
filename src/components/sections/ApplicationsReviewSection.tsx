import { useApplications, useReviewApplication } from '@/hooks/useApplications'
import { useState } from 'react'

interface ApplicationsReviewSectionProps {
  programId: string
}

export default function ApplicationsReviewSection({ programId }: ApplicationsReviewSectionProps) {
  const { data: applications, isLoading } = useApplications(programId)
  const reviewApplication = useReviewApplication()
  const [expandedApp, setExpandedApp] = useState<string | null>(null)
  const [processingAppId, setProcessingAppId] = useState<string | null>(null)

  const pendingApplications = applications?.filter((app) => app.status === 'pending') || []
  const approvedApplications = applications?.filter((app) => app.status === 'approved') || []
  const rejectedApplications = applications?.filter((app) => app.status === 'rejected') || []

  const handleReview = async (applicationId: string, action: 'approve' | 'reject') => {
    setProcessingAppId(applicationId)
    try {
      await reviewApplication.mutateAsync({ applicationId, action })
    } finally {
      setProcessingAppId(null)
    }
  }

  const renderApplicationCard = (application: any, showActions: boolean = false) => (
    <div key={application.id} className="bg-gray-50 rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-medium text-gray-900">
            {application.student?.email || 'Unknown Student'}
          </p>
          <p className="text-sm text-gray-500">
            Submitted: {new Date(application.submitted_at).toLocaleDateString()}
            {application.reviewed_at && (
              <span className="ml-2">
                • Reviewed: {new Date(application.reviewed_at).toLocaleDateString()}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setExpandedApp(expandedApp === application.id ? null : application.id)}
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
          {expandedApp === application.id ? 'Hide' : 'View Details'}
        </button>
      </div>

      {expandedApp === application.id && (
        <div className="mt-3 pt-3 border-t space-y-2">
          <div>
            <strong className="text-sm">Motivation:</strong>
            <p className="text-sm text-gray-700 mt-1">
              {(application.application_data as any)?.motivation || 'N/A'}
            </p>
          </div>
          <div>
            <strong className="text-sm">Experience:</strong>
            <p className="text-sm text-gray-700 mt-1">
              {(application.application_data as any)?.experience || 'N/A'}
            </p>
          </div>
        </div>
      )}

      {showActions && (
        <div className="flex gap-3 mt-3">
          <button
            onClick={() => handleReview(application.id, 'approve')}
            disabled={processingAppId === application.id && reviewApplication.isPending}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processingAppId === application.id && reviewApplication.isPending ? 'Processing...' : 'Approve'}
          </button>
          <button
            onClick={() => handleReview(application.id, 'reject')}
            disabled={processingAppId === application.id && reviewApplication.isPending}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processingAppId === application.id && reviewApplication.isPending ? 'Processing...' : 'Reject'}
          </button>
        </div>
      )}
    </div>
  )

  if (isLoading) {
    return null
  }

  if (!applications || applications.length === 0) {
    return null
  }

  const hasAnyApplications = pendingApplications.length > 0 || approvedApplications.length > 0 || rejectedApplications.length > 0

  if (!hasAnyApplications) {
    return null
  }

  return (
    <div className="border-t pt-6 mt-6 space-y-6">
      {pendingApplications.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Pending Applications ({pendingApplications.length})</h3>
          <div className="space-y-4">
            {pendingApplications.map((application) => renderApplicationCard(application, true))}
          </div>
        </div>
      )}

      {approvedApplications.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-700">Approved Applications ({approvedApplications.length})</h3>
          <div className="space-y-4">
            {approvedApplications.map((application) => renderApplicationCard(application, false))}
          </div>
        </div>
      )}

      {rejectedApplications.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-red-700">Rejected Applications ({rejectedApplications.length})</h3>
          <div className="space-y-4">
            {rejectedApplications.map((application) => renderApplicationCard(application, false))}
          </div>
        </div>
      )}
    </div>
  )
}


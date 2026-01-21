import { useState } from 'react'
import { Mail, User, Calendar, CheckCircle, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Application } from '@/types'
import { formatDateTime } from '@/utils/date'
import StatusBadge from './StatusBadge'
import { getProgramDetailPath } from '@/routes/constants'

interface ApplicationItemProps {
  application: Application
  isReviewing: boolean
  onReview: (applicationId: string, action: 'approve' | 'reject') => void
}

export default function ApplicationItem({ application, isReviewing, onReview }: ApplicationItemProps) {
  const [expandedApp, setExpandedApp] = useState<string | null>(null)

  const toggleExpanded = () => {
    setExpandedApp(expandedApp === application.id ? null : application.id)
  }

  const hasApplicationData =
    application.application_data && Object.keys(application.application_data).length > 0

  return (
    <div className="px-6 py-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {application.student?.full_name || application.student?.email || 'Unknown Student'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="w-3 h-3 text-gray-400" />
                <span className="text-sm text-gray-500">{application.student?.email}</span>
              </div>
            </div>
          </div>
          <div className="ml-13 space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>Applied: {formatDateTime(application.created_at)}</span>
            </div>
            {application.reviewed_at && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Reviewed: {formatDateTime(application.reviewed_at)}</span>
              </div>
            )}
          </div>
          {expandedApp === application.id && application.application_data && (
            <div className="mt-3 ml-13 p-3 bg-gray-50 rounded-md">
              <div className="space-y-2">
                {Object.entries(application.application_data).map(([key, value]) => (
                  <div key={key}>
                    <strong className="text-sm text-gray-700 capitalize">
                      {key.replace(/_/g, ' ')}:
                    </strong>
                    <p className="text-sm text-gray-600 mt-1">{String(value) || 'N/A'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="ml-4 flex flex-col items-end gap-3">
          <StatusBadge status={application.status} />
          {application.status === 'pending' && (
            <div className="flex gap-2">
              <button
                onClick={() => onReview(application.id, 'approve')}
                disabled={isReviewing}
                className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </button>
              <button
                onClick={() => onReview(application.id, 'reject')}
                disabled={isReviewing}
                className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </button>
            </div>
          )}
          {hasApplicationData && (
            <button
              onClick={toggleExpanded}
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              {expandedApp === application.id ? 'Hide Details' : 'View Details'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}


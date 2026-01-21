import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'
import type { Application } from '@/types'
import ApplicationItem from './ApplicationItem'
import { getProgramDetailPath } from '@/routes/constants'

interface ApplicationCardProps {
  programId: string
  applications: Application[]
  isReviewing: boolean
  onReview: (applicationId: string, action: 'approve' | 'reject') => void
}

export default function ApplicationCard({
  programId,
  applications,
  isReviewing,
  onReview,
}: ApplicationCardProps) {
  const program = applications[0]?.program

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {program?.title || 'Unknown Program'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{program?.description || 'No description'}</p>
          </div>
          <Link
            to={getProgramDetailPath(programId)}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            <Eye className="w-4 h-4 mr-1" />
            View Program
          </Link>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {applications.map((application) => (
          <ApplicationItem
            key={application.id}
            application={application}
            isReviewing={isReviewing}
            onReview={onReview}
          />
        ))}
      </div>
    </div>
  )
}


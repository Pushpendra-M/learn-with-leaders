import { Plus } from 'lucide-react'
import type { Assessment } from '@/types'
import AssessmentCard from './AssessmentCard'

interface AssessmentsSectionProps {
  assessments: Assessment[] | undefined
  canCreate: boolean
  canEdit: boolean
  onCreateClick: () => void
  onEditClick: (assessment: Assessment) => void
}

export default function AssessmentsSection({
  assessments,
  canCreate,
  canEdit,
  onCreateClick,
  onEditClick,
}: AssessmentsSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Assessments</h2>
        {canCreate && (
          <button
            onClick={onCreateClick}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Assessment
          </button>
        )}
      </div>
      {assessments && assessments.length > 0 ? (
        <div className="space-y-4">
          {assessments.map((assessment) => (
            <AssessmentCard
              key={assessment.id}
              assessment={assessment}
              canEdit={canEdit}
              onEdit={onEditClick}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No assessments available yet.</p>
      )}
    </div>
  )
}


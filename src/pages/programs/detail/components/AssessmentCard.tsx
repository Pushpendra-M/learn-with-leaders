import { useNavigate } from 'react-router-dom'
import { Edit } from 'lucide-react'
import { formatDateShort } from '@/utils/date'
import { getAssessmentDetailPath } from '@/routes/constants'
import type { Assessment } from '@/types'

interface AssessmentCardProps {
  assessment: Assessment
  canEdit: boolean
  onEdit: (assessment: Assessment) => void
}

export default function AssessmentCard({ assessment, canEdit, onEdit }: AssessmentCardProps) {
  const navigate = useNavigate()

  const getQuestionCount = (description: string | null): number => {
    if (!description) return 0
    try {
      const parsed = JSON.parse(description)
      return parsed.totalQuestions || 0
    } catch (e) {
      return 0
    }
  }

  const questionCount = getQuestionCount(assessment.description)

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{assessment.title}</h3>
          {questionCount > 0 ? (
            <p className="text-sm text-gray-600 mt-1">{questionCount} questions</p>
          ) : (
            <p className="text-sm text-gray-600 mt-1">
              {assessment.description && !assessment.description.startsWith('{')
                ? assessment.description
                : 'Assessment questions'}
            </p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span>Type: {assessment.type}</span>
            {assessment.due_date && <span>Due: {formatDateShort(assessment.due_date)}</span>}
            <span>Max Score: {assessment.max_score}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={() => onEdit(assessment)}
              className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium"
            >
              <Edit className="w-4 h-4 inline mr-1" />
              Edit
            </button>
          )}
          <button
            onClick={() => navigate(getAssessmentDetailPath(assessment.id))}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
          >
            View
          </button>
        </div>
      </div>
    </div>
  )
}


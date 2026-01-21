import { ArrowLeft, Calendar, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatDateTime } from '@/utils/date'
import { getProgramDetailPath } from '@/routes/constants'
import type { Assessment } from '@/types'

interface AssessmentHeaderProps {
  assessment: Assessment
}

export default function AssessmentHeader({ assessment }: AssessmentHeaderProps) {
  const navigate = useNavigate()

  return (
    <>
      <button
        onClick={() => navigate(getProgramDetailPath(assessment.program_id))}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Program
      </button>

      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{assessment.title}</h1>

        <div className="space-y-4 mb-6">
          <div className="flex items-center text-gray-600">
            <FileText className="w-5 h-5 mr-3" />
            <span>Type: {assessment.type}</span>
          </div>
          {assessment.due_date && (
            <div className="flex items-center text-gray-600">
              <Calendar className="w-5 h-5 mr-3" />
              <span>Due: {formatDateTime(assessment.due_date)}</span>
            </div>
          )}
          <div className="text-gray-600">
            <span>Maximum Score: {assessment.max_score} points</span>
          </div>
        </div>
      </div>
    </>
  )
}


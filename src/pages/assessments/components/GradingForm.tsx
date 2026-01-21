import type { GradingData } from '../types'

interface GradingFormProps {
  submissionId: string
  maxScore: number
  gradingData: GradingData
  isGrading: boolean
  onScoreChange: (submissionId: string, score: number) => void
  onFeedbackChange: (submissionId: string, feedback: string) => void
  onGrade: (submissionId: string) => void
}

export default function GradingForm({
  submissionId,
  maxScore,
  gradingData,
  isGrading,
  onScoreChange,
  onFeedbackChange,
  onGrade,
}: GradingFormProps) {
  const currentGrading = gradingData[submissionId] || { score: 0, feedback: '' }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Score (0 - {maxScore})
        </label>
        <input
          type="number"
          min="0"
          max={maxScore}
          value={currentGrading.score || ''}
          onChange={(e) => onScoreChange(submissionId, parseInt(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
        <textarea
          value={currentGrading.feedback || ''}
          onChange={(e) => onFeedbackChange(submissionId, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={3}
          placeholder="Provide feedback..."
        />
      </div>
      <button
        onClick={() => onGrade(submissionId)}
        disabled={isGrading || !currentGrading.score}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
      >
        {isGrading ? 'Grading...' : 'Grade Submission'}
      </button>
    </div>
  )
}


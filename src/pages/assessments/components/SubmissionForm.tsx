import { CheckCircle } from 'lucide-react'
import { formatDateTime } from '@/utils/date'
import type { Question } from '../types'
import type { AssessmentSubmission } from '@/types'

interface SubmissionFormProps {
  hasQuestions: boolean
  questions: Question[]
  submissionText: string
  answers: { [key: number]: string }
  mySubmission: AssessmentSubmission | null | undefined
  hasSubmitted: boolean
  hasDraft: boolean
  isSubmitting: boolean
  maxScore: number
  onSubmissionTextChange: (text: string) => void
  onAnswerChange: (index: number, value: string) => void
  onSubmit: (status: 'draft' | 'submitted') => void
}

export default function SubmissionForm({
  hasQuestions,
  questions,
  submissionText,
  answers,
  mySubmission,
  hasSubmitted,
  hasDraft,
  isSubmitting,
  maxScore,
  onSubmissionTextChange,
  onAnswerChange,
  onSubmit,
}: SubmissionFormProps) {
  const canSubmit =
    (!hasQuestions && submissionText.trim()) || (hasQuestions && Object.keys(answers).length > 0)

  if (hasSubmitted) {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center text-blue-600 mb-2">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">
              {mySubmission?.status === 'graded' ? 'Submission Graded' : 'Submission Completed'}
            </span>
          </div>
          <p className="text-blue-800 text-sm">
            You have already submitted this assessment. Resubmission is not allowed.
          </p>
          {mySubmission?.submitted_at && (
            <p className="text-sm text-blue-600 mt-2">
              Submitted: {formatDateTime(mySubmission.submitted_at)}
            </p>
          )}
        </div>

        {mySubmission?.status === 'graded' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center text-green-600 mb-2">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">Graded</span>
            </div>
            <div className="space-y-2">
              <p>
                <strong>Score:</strong> {mySubmission.score} / {maxScore}
              </p>
              {mySubmission.feedback && (
                <div>
                  <strong>Feedback:</strong>
                  <p className="mt-1 text-gray-700">{mySubmission.feedback}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {hasQuestions && mySubmission && (mySubmission.submission_data as any)?.answers && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Your Submitted Answers</h3>
            <div className="space-y-3">
              {questions.map((question, index) => {
                const submittedAnswer = (mySubmission.submission_data as any).answers[index]
                return (
                  <div key={index} className="border-b border-gray-200 pb-3 last:border-0">
                    <p className="font-medium text-gray-900 mb-1">
                      Q{index + 1}: {question.question}
                    </p>
                    <p className="text-gray-600 ml-4">
                      Your Answer: {submittedAnswer || 'Not answered'}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {!hasQuestions && mySubmission && (mySubmission.submission_data as any)?.answer && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Your Submitted Answer</h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {(mySubmission.submission_data as any).answer}
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!hasQuestions && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Answer</label>
          <textarea
            value={submissionText}
            onChange={(e) => onSubmissionTextChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={10}
            placeholder="Enter your submission here..."
          />
        </div>
      )}
      <div className="flex gap-3">
        <button
          onClick={() => onSubmit('submitted')}
          disabled={isSubmitting || !canSubmit}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
        <button
          onClick={() => onSubmit('draft')}
          disabled={isSubmitting}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
        >
          Save Draft
        </button>
      </div>
      {hasDraft && (
        <p className="text-sm text-gray-500">
          You have a saved draft. You can edit it before submitting.
        </p>
      )}
    </div>
  )
}


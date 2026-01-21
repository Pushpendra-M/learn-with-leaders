import { formatDateTime } from '@/utils/date'
import type { AssessmentSubmission } from '@/types'
import type { Question } from '../types'
import GradingForm from './GradingForm'
import type { GradingData } from '../types'

interface SubmissionCardProps {
  submission: AssessmentSubmission
  questions: Question[]
  hasQuestions: boolean
  correctAnswersMap: Map<number, string>
  maxScore: number
  gradingData: GradingData
  isGrading: boolean
  onScoreChange: (submissionId: string, score: number) => void
  onFeedbackChange: (submissionId: string, feedback: string) => void
  onGrade: (submissionId: string) => void
}

export default function SubmissionCard({
  submission,
  questions,
  hasQuestions,
  correctAnswersMap,
  maxScore,
  gradingData,
  isGrading,
  onScoreChange,
  onFeedbackChange,
  onGrade,
}: SubmissionCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-medium text-gray-900">
            {submission.student?.email || 'Unknown Student'}
          </p>
          <p className="text-sm text-gray-500">
            Status: {submission.status} | Submitted:{' '}
            {submission.submitted_at ? formatDateTime(submission.submitted_at) : 'Not submitted'}
          </p>
        </div>
        {submission.status === 'graded' && (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            {submission.score} / {maxScore}
          </span>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-3">
        {hasQuestions && (submission.submission_data as any)?.answers ? (
          <div className="space-y-4">
            {questions.map((question, qIndex) => {
              const studentAnswer =
                (submission.submission_data as any).answers[qIndex] || 'Not answered'
              const correctAnswer = correctAnswersMap.get(qIndex)
              const isCorrect = correctAnswer && studentAnswer === correctAnswer
              return (
                <div key={qIndex} className="border-b border-gray-200 pb-3 last:border-0">
                  <p className="font-medium text-gray-900 mb-2">
                    Q{qIndex + 1}: {question.question} ({question.points} points)
                  </p>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Student Answer:</span> {studentAnswer}
                    </p>
                    {correctAnswer && (
                      <p
                        className={`text-sm font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}
                      >
                        <span className="font-medium">Correct Answer:</span> {correctAnswer}
                        {isCorrect && ' ✓'}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {(submission.submission_data as any)?.answer || 'No submission'}
          </p>
        )}
      </div>

      {submission.status !== 'graded' && (
        <GradingForm
          submissionId={submission.id}
          maxScore={maxScore}
          gradingData={gradingData}
          isGrading={isGrading}
          onScoreChange={onScoreChange}
          onFeedbackChange={onFeedbackChange}
          onGrade={onGrade}
        />
      )}

      {submission.status === 'graded' && submission.feedback && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-sm font-medium text-gray-700 mb-1">Feedback:</p>
          <p className="text-sm text-gray-600">{submission.feedback}</p>
        </div>
      )}
    </div>
  )
}


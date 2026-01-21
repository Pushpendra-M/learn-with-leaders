import type { Question } from '../types'

interface QuestionCardProps {
  question: Question
  index: number
  answer?: string
  correctAnswer?: string
  showCorrectAnswer: boolean
  isStudent: boolean
  canSubmit: boolean
  hasSubmitted: boolean
  onAnswerChange: (index: number, value: string) => void
}

export default function QuestionCard({
  question,
  index,
  answer,
  correctAnswer,
  showCorrectAnswer,
  isStudent,
  canSubmit,
  hasSubmitted,
  onAnswerChange,
}: QuestionCardProps) {
  const handleChange = (value: string) => {
    onAnswerChange(index, value)
  }

  const currentAnswer = answer || ''

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="mb-3">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-900">
            Question {index + 1} ({question.points} points)
          </h3>
          {showCorrectAnswer && correctAnswer && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
              Correct: {correctAnswer}
            </span>
          )}
        </div>
        <p className="text-gray-700 mb-4">{question.question}</p>
      </div>

      {isStudent && canSubmit && !hasSubmitted && (
        <div className="mt-4">
          {question.type === 'multiple_choice' && question.options ? (
            <div className="space-y-2">
              {question.options.map((option, optIndex) => (
                <label
                  key={optIndex}
                  className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={option}
                    checked={currentAnswer === option}
                    onChange={(e) => handleChange(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          ) : question.type === 'true_false' ? (
            <div className="space-y-2">
              <label className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${index}`}
                  value="true"
                  checked={currentAnswer === 'true'}
                  onChange={(e) => handleChange(e.target.value)}
                  className="mr-3"
                />
                <span className="text-gray-700">True</span>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${index}`}
                  value="false"
                  checked={currentAnswer === 'false'}
                  onChange={(e) => handleChange(e.target.value)}
                  className="mr-3"
                />
                <span className="text-gray-700">False</span>
              </label>
            </div>
          ) : (
            <textarea
              value={currentAnswer}
              onChange={(e) => handleChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={4}
              placeholder="Enter your answer here..."
            />
          )}
        </div>
      )}

      {isStudent && answer && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm font-medium text-gray-700 mb-1">Your Answer:</p>
          <p className="text-gray-600">{answer || 'Not answered'}</p>
        </div>
      )}

      {showCorrectAnswer && correctAnswer && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm font-medium text-green-800 mb-1">Correct Answer:</p>
          <p className="text-green-900 font-semibold">{correctAnswer}</p>
        </div>
      )}
    </div>
  )
}


import { useState, useEffect } from 'react'
import { useCreateAssessment, useUpdateAssessment } from '@/hooks/useAssessments'
import { useUpsertAssessmentAnswer, useAssessmentAnswer } from '@/hooks/useAssessmentAnswers'
import { FileText, Calendar, X, Plus, Trash2 } from 'lucide-react'
import type { AssessmentType, Assessment } from '@/types'

interface Question {
  id: string
  question: string
  type: 'multiple_choice' | 'text' | 'true_false'
  options?: string[]
  correctAnswer?: string
  points: number
}

interface CreateAssessmentModalProps {
  isOpen: boolean
  onClose: () => void
  programId: string
  assessment?: Assessment | null
}

export default function CreateAssessmentModal({ isOpen, onClose, programId, assessment }: CreateAssessmentModalProps) {
  const createAssessment = useCreateAssessment()
  const updateAssessment = useUpdateAssessment()
  const upsertAnswer = useUpsertAssessmentAnswer()
  const { data: existingAnswer, isLoading: isLoadingAnswer } = useAssessmentAnswer(assessment?.id || '', {
    enabled: !!assessment?.id && isOpen,
  })
  const isEditMode = !!assessment

  const [title, setTitle] = useState('')
  const [type, setType] = useState<AssessmentType>('quiz')
  const [dueDate, setDueDate] = useState('')
  const [maxScore, setMaxScore] = useState(100)
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    if (!isOpen) return
    
    if (assessment) {
      if (isEditMode && isLoadingAnswer) {
        return
      }
      
      setTitle(assessment.title)
      setType(assessment.type)
      setMaxScore(assessment.max_score)
      
      if (assessment.due_date) {
        const date = new Date(assessment.due_date)
        const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16)
        setDueDate(localDateTime)
      } else {
        setDueDate('')
      }

      if (assessment.description) {
        try {
          const parsed = JSON.parse(assessment.description)
          if (parsed.questions && Array.isArray(parsed.questions)) {
            let correctAnswersMap: Record<number, string> = {}
            if (existingAnswer?.correct_answer) {
              try {
                correctAnswersMap = JSON.parse(existingAnswer.correct_answer)
              } catch (e) {

                correctAnswersMap = { 0: existingAnswer.correct_answer }
              }
            }
            const loadedQuestions = parsed.questions.map((q: any, index: number) => ({
              id: `q-${index}-${Date.now()}`,
              question: q.question || '',
              type: q.type || 'multiple_choice',
              options: q.options || (q.type === 'multiple_choice' ? ['', '', '', ''] : undefined),
              correctAnswer: correctAnswersMap[index] || '',
              points: q.points || 10,
            }))
            setQuestions(loadedQuestions)
          } else {
            setQuestions([])
          }
        } catch (e) {
          setQuestions([])
        }
      } else {
        setQuestions([])
      }
    } else {
      setTitle('')
      setType('quiz')
      setDueDate('')
      setMaxScore(100)
      setQuestions([])
    }
  }, [assessment, isOpen, existingAnswer, isEditMode, isLoadingAnswer])

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        question: '',
        type: 'multiple_choice',
        options: ['', '', '', ''],
        correctAnswer: '',
        points: 10,
      },
    ])
  }

  const removeQuestion = (questionId: string) => {
    setQuestions(questions.filter((q) => q.id !== questionId))
  }

  const updateQuestion = (questionId: string, field: keyof Question, value: any) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          if (field === 'type') {
            return {
              ...q,
              type: value,
              options: value === 'multiple_choice' ? ['', '', '', ''] : undefined,
              correctAnswer: '',
            }
          }
          return { ...q, [field]: value }
        }
        return q
      })
    )
  }

  const updateQuestionOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.options) {
          const newOptions = [...q.options]
          newOptions[optionIndex] = value
          return { ...q, options: newOptions }
        }
        return q
      })
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      alert('Please enter a title')
      return
    }

    if (questions.length === 0) {
      alert('Please add at least one question')
      return
    }

    try {
      const questionsData = questions.map((q) => ({
        question: q.question,
        type: q.type,
        options: q.options,
        points: q.points,
      }))

      const description = JSON.stringify({
        questions: questionsData,
        totalQuestions: questions.length,
      })

      let createdAssessmentId: string

      if (isEditMode && assessment) {
        const updated = await updateAssessment.mutateAsync({
          assessmentId: assessment.id,
          programId,
          title,
          description,
          type,
          dueDate: dueDate || undefined,
          maxScore,
        })
        createdAssessmentId = updated.id
      } else {
        const created = await createAssessment.mutateAsync({
          programId,
          title,
          description,
          type,
          dueDate: dueDate || undefined,
          maxScore,
        })
        createdAssessmentId = created.id
      }

      const correctAnswersMap: Record<number, string> = {}
      questions.forEach((q, index) => {
        if (q.correctAnswer && q.correctAnswer.trim()) {
          correctAnswersMap[index] = q.correctAnswer.trim()
        }
      })

      await upsertAnswer.mutateAsync({
        assessmentId: createdAssessmentId,
        correctAnswer: Object.keys(correctAnswersMap).length > 0 ? JSON.stringify(correctAnswersMap) : '{}',
      })

      setTitle('')
      setType('quiz')
      setDueDate('')
      setMaxScore(100)
      setQuestions([])
      onClose()
    } catch (error) {
      console.error('Error saving assessment:', error)
    }
  }

  if (!isOpen) return null

  if (isEditMode && isLoadingAnswer) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading assessment data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Assessment' : 'Create Assessment'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter assessment title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AssessmentType)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="quiz">Quiz</option>
              <option value="assignment">Assignment</option>
              <option value="project">Project</option>
              <option value="exam">Exam</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Due Date
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Score *
            </label>
            <input
              type="number"
              value={maxScore}
              onChange={(e) => setMaxScore(parseInt(e.target.value) || 100)}
              min="1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
              <button
                type="button"
                onClick={addQuestion}
                className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Question
              </button>
            </div>

            {questions.length === 0 ? (
              <p className="text-gray-500 text-sm">No questions added yet. Click "Add Question" to get started.</p>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm font-medium text-gray-700">Question {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeQuestion(question.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question Text *
                        </label>
                        <textarea
                          value={question.question}
                          onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          rows={2}
                          placeholder="Enter your question"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question Type *
                        </label>
                        <select
                          value={question.type}
                          onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="text">Text Answer</option>
                          <option value="true_false">True/False</option>
                        </select>
                      </div>

                      {question.type === 'multiple_choice' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Options *
                          </label>
                          {question.options?.map((option, optIndex) => (
                            <input
                              key={optIndex}
                              type="text"
                              value={option}
                              onChange={(e) => updateQuestionOption(question.id, optIndex, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
                              placeholder={`Option ${optIndex + 1}`}
                              required
                            />
                          ))}
                          <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Correct Answer *
                            </label>
                            <select
                              value={question.correctAnswer || ''}
                              onChange={(e) => updateQuestion(question.id, 'correctAnswer', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              required
                            >
                              <option value="">Select correct answer</option>
                              {question.options?.map((opt, idx) => (
                                <option key={idx} value={opt}>
                                  {opt || `Option ${idx + 1}`}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}

                      {question.type === 'true_false' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Correct Answer *
                          </label>
                          <select
                            value={question.correctAnswer || ''}
                            onChange={(e) => updateQuestion(question.id, 'correctAnswer', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                          >
                            <option value="">Select correct answer</option>
                            <option value="true">True</option>
                            <option value="false">False</option>
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Points *
                        </label>
                        <input
                          type="number"
                          value={question.points}
                          onChange={(e) => updateQuestion(question.id, 'points', parseInt(e.target.value) || 0)}
                          min="1"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={
                createAssessment.isPending ||
                updateAssessment.isPending ||
                upsertAnswer.isPending
              }
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEditMode
                ? updateAssessment.isPending || upsertAnswer.isPending
                  ? 'Updating...'
                  : 'Update Assessment'
                : createAssessment.isPending || upsertAnswer.isPending
                ? 'Creating...'
                : 'Create Assessment'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


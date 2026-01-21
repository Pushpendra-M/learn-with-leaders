import { useParams, useNavigate } from 'react-router-dom'
import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  useAssessment,
  useMySubmission,
  useSubmitAssessment,
  useGradeSubmission,
  useAssessmentSubmissions,
} from '@/hooks/useAssessments'
import { useAssessmentAnswer } from '@/hooks/useAssessmentAnswers'
import toast from 'react-hot-toast'
import Loading from '@/components/common/Loading'
import AssessmentHeader from './components/AssessmentHeader'
import QuestionCard from './components/QuestionCard'
import SubmissionForm from './components/SubmissionForm'
import SubmissionCard from './components/SubmissionCard'
import { parseQuestions, parseCorrectAnswers, getSubmissionData } from './utils'
import type { GradingData } from './types'
import { getProgramDetailPath } from '@/routes/constants'

export default function AssessmentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { data: assessment, isLoading: assessmentLoading } = useAssessment(id || '')
  const { data: mySubmission } = useMySubmission(id || '')
  const { data: submissions } = useAssessmentSubmissions(id || '')
  const { data: correctAnswerData } = useAssessmentAnswer(id || '', {
    enabled: (profile?.role === 'mentor' || profile?.role === 'admin') && !!id,
  })
  const submitAssessment = useSubmitAssessment()
  const gradeSubmission = useGradeSubmission()

  const questions = useMemo(() => parseQuestions(assessment?.description), [assessment?.description])

  const correctAnswersMap = useMemo(
    () => parseCorrectAnswers(correctAnswerData?.correct_answer),
    [correctAnswerData?.correct_answer]
  )

  const hasQuestions = questions.length > 0

  const [submissionText, setSubmissionText] = useState('')
  const [answers, setAnswers] = useState<{ [key: number]: string }>({})
  const [gradingData, setGradingData] = useState<GradingData>({})

  useEffect(() => {
    if (mySubmission?.submission_data && mySubmission.status === 'draft') {
      const submissionData = mySubmission.submission_data as any
      if (submissionData.answers) {
        setAnswers(submissionData.answers)
      } else if (submissionData.answer) {
        setSubmissionText(submissionData.answer)
      }
    } else if (!mySubmission) {
      setAnswers({})
      setSubmissionText('')
    }
  }, [mySubmission])

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers({ ...answers, [index]: value })
  }

  const handleSubmit = async (status: 'draft' | 'submitted') => {
    if (!id) return

    const submissionData = getSubmissionData(hasQuestions, answers, submissionText, questions)

    await submitAssessment.mutateAsync({
      assessmentId: id,
      submissionData,
      status,
    })
  }

  const handleScoreChange = (submissionId: string, score: number) => {
    setGradingData({
      ...gradingData,
      [submissionId]: {
        ...gradingData[submissionId],
        score,
      },
    })
  }

  const handleFeedbackChange = (submissionId: string, feedback: string) => {
    setGradingData({
      ...gradingData,
      [submissionId]: {
        ...gradingData[submissionId],
        feedback,
      },
    })
  }

  const handleGrade = async (submissionId: string) => {
    const grading = gradingData[submissionId]
    if (!grading) {
      toast.error('Please provide a score')
      return
    }

    await gradeSubmission.mutateAsync({
      submissionId,
      score: grading.score,
      feedback: grading.feedback,
    })

    setGradingData({ ...gradingData, [submissionId]: { score: 0, feedback: '' } })
  }

  if (assessmentLoading) {
    return <Loading loading={true} />
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Assessment not found.</p>
          <button
            onClick={() => navigate('/programs')}
            className="mt-4 text-indigo-600 hover:text-indigo-700"
          >
            Back to Programs
          </button>
        </div>
      </div>
    )
  }

  const isStudent = profile?.role === 'student'
  const isMentor = profile?.role === 'mentor' || profile?.role === 'admin'
  const hasSubmitted =
    !!mySubmission && (mySubmission.status === 'submitted' || mySubmission.status === 'graded')
  const hasDraft = !!mySubmission && mySubmission.status === 'draft'
  const canSubmit = isStudent && !hasSubmitted
  const canGrade = isMentor

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <AssessmentHeader assessment={assessment} />

        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          {hasQuestions ? (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Questions</h2>
              <div className="space-y-6">
                {questions.map((question, index) => {
                  const correctAnswer = correctAnswersMap.get(index)
                  const showCorrectAnswer = isMentor && !!correctAnswer
                  const submittedAnswer =
                    isStudent && mySubmission && (mySubmission.submission_data as any)?.answers
                      ? (mySubmission.submission_data as any).answers[index]
                      : undefined
                  const currentAnswer = hasSubmitted ? submittedAnswer : answers[index]

                  return (
                    <QuestionCard
                      key={index}
                      question={question}
                      index={index}
                      answer={currentAnswer}
                      correctAnswer={correctAnswer}
                      showCorrectAnswer={showCorrectAnswer}
                      isStudent={isStudent}
                      canSubmit={canSubmit}
                      hasSubmitted={hasSubmitted}
                      onAnswerChange={handleAnswerChange}
                    />
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 whitespace-pre-wrap">
                {assessment.description || 'No description available.'}
              </p>
            </div>
          )}

          {isStudent && (
            <div className="border-t pt-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Your Submission</h2>
              <SubmissionForm
                hasQuestions={hasQuestions}
                questions={questions}
                submissionText={submissionText}
                answers={answers}
                mySubmission={mySubmission}
                hasSubmitted={hasSubmitted}
                hasDraft={hasDraft}
                isSubmitting={submitAssessment.isPending}
                maxScore={assessment.max_score}
                onSubmissionTextChange={setSubmissionText}
                onAnswerChange={handleAnswerChange}
                onSubmit={handleSubmit}
              />
            </div>
          )}

          {canGrade && submissions && submissions.length > 0 && (
            <div className="border-t pt-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Submissions ({submissions.length})</h2>
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <SubmissionCard
                    key={submission.id}
                    submission={submission}
                    questions={questions}
                    hasQuestions={hasQuestions}
                    correctAnswersMap={correctAnswersMap}
                    maxScore={assessment.max_score}
                    gradingData={gradingData}
                    isGrading={gradeSubmission.isPending}
                    onScoreChange={handleScoreChange}
                    onFeedbackChange={handleFeedbackChange}
                    onGrade={handleGrade}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


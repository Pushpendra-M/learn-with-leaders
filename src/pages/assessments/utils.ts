import type { Question } from './types'

export const parseQuestions = (description: string | null | undefined): Question[] => {
  if (!description) return []
  try {
    const parsed = JSON.parse(description)
    if (parsed.questions && Array.isArray(parsed.questions)) {
      return parsed.questions.map((q: any) => ({
        question: q.question,
        type: q.type,
        options: q.options,
        points: q.points,
      })) as Question[]
    }
  } catch (e) {
    return []
  }
  return []
}

export const parseCorrectAnswers = (correctAnswer: string | null | undefined): Map<number, string> => {
  if (!correctAnswer) return new Map<number, string>()
  try {
    const parsed = JSON.parse(correctAnswer)
    const map = new Map<number, string>()
    Object.entries(parsed).forEach(([index, answer]) => {
      map.set(Number(index), answer as string)
    })
    return map
  } catch (e) {
    const map = new Map<number, string>()
    map.set(0, correctAnswer)
    return map
  }
}

export const getSubmissionData = (
  hasQuestions: boolean,
  answers: { [key: number]: string },
  submissionText: string,
  questions: Question[]
) => {
  const submissionData: any = {
    submittedAt: new Date().toISOString(),
  }

  if (hasQuestions) {
    submissionData.answers = answers
    submissionData.questions = questions.map((q, idx) => ({
      question: q.question,
      answer: answers[idx] || '',
    }))
  } else {
    submissionData.answer = submissionText
  }

  return submissionData
}


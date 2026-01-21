export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  TEXT: 'text',
  TRUE_FALSE: 'true_false',
} as const

export const SUBMISSION_STATUSES = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  GRADED: 'graded',
} as const

export type QuestionType = (typeof QUESTION_TYPES)[keyof typeof QUESTION_TYPES]
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[keyof typeof SUBMISSION_STATUSES]


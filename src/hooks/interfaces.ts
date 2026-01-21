export interface AssessmentAnswer {
  assessment_id: string
  correct_answer: string
  grading_notes?: string | null
  created_at: string
}

export interface CreateApplicationParams {
  programId: string
  applicationData: Record<string, unknown>
}

export interface ReviewApplicationParams {
  applicationId: string
  action: 'approve' | 'reject'
}

export interface CreateAssessmentParams {
  programId: string
  title: string
  description?: string
  type: string
  dueDate?: string
  maxScore: number
}

export interface UpdateAssessmentParams {
  assessmentId: string
  programId: string
  title: string
  description?: string
  type: string
  dueDate?: string
  maxScore: number
}

export interface SubmitAssessmentParams {
  assessmentId: string
  submissionData: Record<string, unknown>
  status?: 'draft' | 'submitted'
}

export interface GradeSubmissionParams {
  submissionId: string
  score: number
  feedback?: string
}

export interface CreateAssessmentAnswerParams {
  assessmentId: string
  correctAnswer: string
  gradingNotes?: string
}

export interface UpdateAssessmentAnswerParams {
  assessmentId: string
  correctAnswer: string
  gradingNotes?: string
}

export interface CreateProgramParams {
  title: string
  description?: string
  startDate?: string
  endDate?: string
  maxStudents?: number
  status: 'draft' | 'open' | 'closed' | 'completed'
  mentorIds?: string[]
}

export interface UpdateProgramParams {
  programId: string
  title: string
  description?: string
  startDate?: string
  endDate?: string
  maxStudents?: number
  status: 'draft' | 'open' | 'closed' | 'completed'
  mentorIds?: string[]
}

export interface QueryOptions {
  enabled?: boolean
}


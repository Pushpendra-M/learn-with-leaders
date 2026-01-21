export interface Question {
  question: string
  type: 'multiple_choice' | 'text' | 'true_false'
  options?: string[]
  points: number
}

export interface GradingData {
  [key: string]: {
    score: number
    feedback: string
  }
}


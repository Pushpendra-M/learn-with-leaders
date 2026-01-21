import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { QUERY_KEYS, TABLES, ERROR_CODES, CONFLICT_COLUMN, MESSAGES } from './constants'
import type { AssessmentAnswer, CreateAssessmentAnswerParams, UpdateAssessmentAnswerParams, QueryOptions } from './interfaces'

function getQueryKey(assessmentId: string) {
  return [...QUERY_KEYS.ASSESSMENT_ANSWER, assessmentId] as const
}

export function useAssessmentAnswer(assessmentId: string, options?: QueryOptions) {
  return useQuery({
    queryKey: getQueryKey(assessmentId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLES.ASSESSMENT_ANSWERS)
        .select('*')
        .eq('assessment_id', assessmentId)
        .single()

      if (error) {
        if (error.code === ERROR_CODES.NOT_FOUND) {
          return null
        }
        throw error
      }
      return data as AssessmentAnswer | null
    },
    enabled: options?.enabled !== false && !!assessmentId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

export function useCreateAssessmentAnswer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: CreateAssessmentAnswerParams) => {
      const { data, error } = await supabase
        .from(TABLES.ASSESSMENT_ANSWERS)
        .insert({
          assessment_id: params.assessmentId,
          correct_answer: params.correctAnswer,
          grading_notes: params.gradingNotes || null,
        })
        .select()
        .single()

      if (error) throw error
      return data as AssessmentAnswer
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: getQueryKey(variables.assessmentId) })
      toast.success(MESSAGES.ASSESSMENT_ANSWERS_SAVED)
    },
    onError: (error: Error) => {
      toast.error(error.message || MESSAGES.ASSESSMENT_ANSWERS_SAVE_FAILED)
    },
  })
}

export function useUpdateAssessmentAnswer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: UpdateAssessmentAnswerParams) => {
      const { data, error } = await supabase
        .from(TABLES.ASSESSMENT_ANSWERS)
        .update({
          correct_answer: params.correctAnswer,
          grading_notes: params.gradingNotes || null,
        })
        .eq('assessment_id', params.assessmentId)
        .select()
        .single()

      if (error) throw error
      return data as AssessmentAnswer
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: getQueryKey(variables.assessmentId) })
      toast.success(MESSAGES.ASSESSMENT_ANSWERS_UPDATED)
    },
    onError: (error: Error) => {
      toast.error(error.message || MESSAGES.ASSESSMENT_ANSWERS_UPDATE_FAILED)
    },
  })
}

export function useUpsertAssessmentAnswer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: CreateAssessmentAnswerParams) => {
      const { data, error } = await supabase
        .from(TABLES.ASSESSMENT_ANSWERS)
        .upsert(
          {
            assessment_id: params.assessmentId,
            correct_answer: params.correctAnswer,
            grading_notes: params.gradingNotes || null,
          },
          {
            onConflict: CONFLICT_COLUMN,
          }
        )
        .select()
        .single()

      if (error) throw error
      return data as AssessmentAnswer
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: getQueryKey(variables.assessmentId) })
      toast.success(MESSAGES.ASSESSMENT_ANSWERS_SAVED)
    },
    onError: (error: Error) => {
      toast.error(error.message || MESSAGES.ASSESSMENT_ANSWERS_SAVE_FAILED)
    },
  })
}


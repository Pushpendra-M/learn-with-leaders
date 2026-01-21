import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Assessment, AssessmentSubmission } from '@/types'
import toast from 'react-hot-toast'
import { QUERY_KEYS, TABLES, ERROR_CODES, STATUS, MESSAGES } from './constants'
import type { CreateAssessmentParams, UpdateAssessmentParams, SubmitAssessmentParams, GradeSubmissionParams, QueryOptions } from './interfaces'

function getAssessmentsQueryKey(programId: string) {
  return [...QUERY_KEYS.ASSESSMENTS, programId] as const
}

function getAssessmentQueryKey(id: string) {
  return [...QUERY_KEYS.ASSESSMENT, id] as const
}

function getSubmissionsQueryKey(assessmentId: string) {
  return [...QUERY_KEYS.ASSESSMENT_SUBMISSIONS, assessmentId] as const
}

function getMySubmissionQueryKey(assessmentId: string) {
  return [...QUERY_KEYS.MY_SUBMISSION, assessmentId] as const
}

export function useAssessments(programId: string, options?: QueryOptions) {
  return useQuery({
    queryKey: getAssessmentsQueryKey(programId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLES.ASSESSMENTS)
        .select(`
          *,
          creator:profiles!assessments_created_by_fkey(*)
        `)
        .eq('program_id', programId)
        .order('due_date', { ascending: true })

      if (error) throw error
      return data as Assessment[]
    },
    enabled: options?.enabled !== false && !!programId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

export function useAssessment(id: string) {
  return useQuery({
    queryKey: getAssessmentQueryKey(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLES.ASSESSMENTS)
        .select(`
          *,
          program:programs(*),
          creator:profiles!assessments_created_by_fkey(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Assessment
    },
    enabled: !!id,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

export function useAssessmentSubmissions(assessmentId: string) {
  return useQuery({
    queryKey: getSubmissionsQueryKey(assessmentId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLES.ASSESSMENT_SUBMISSIONS)
        .select(`
          *,
          student:profiles!assessment_submissions_student_id_fkey(*),
          grader:profiles!assessment_submissions_graded_by_fkey(*)
        `)
        .eq('assessment_id', assessmentId)
        .order('submitted_at', { ascending: false })

      if (error) throw error
      return data as AssessmentSubmission[]
    },
    enabled: !!assessmentId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

export function useMySubmission(assessmentId: string) {
  return useQuery({
    queryKey: getMySubmissionQueryKey(assessmentId),
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error(MESSAGES.NOT_AUTHENTICATED)

      const { data, error } = await supabase
        .from(TABLES.ASSESSMENT_SUBMISSIONS)
        .select(`
          *,
          assessment:assessments(*)
        `)
        .eq('assessment_id', assessmentId)
        .eq('student_id', user.id)
        .single()

      if (error) {
        if (error.code === ERROR_CODES.NOT_FOUND) {
          return null
        }
        throw error
      }
      return data as AssessmentSubmission | null
    },
    enabled: !!assessmentId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

export function useCreateAssessment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: CreateAssessmentParams) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error(MESSAGES.NOT_AUTHENTICATED)

      const { data, error } = await supabase
        .from(TABLES.ASSESSMENTS)
        .insert({
          program_id: params.programId,
          title: params.title,
          description: params.description,
          type: params.type,
          due_date: params.dueDate || null,
          max_score: params.maxScore,
          created_by: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return data as Assessment
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: getAssessmentsQueryKey(variables.programId) })
      queryClient.invalidateQueries({ queryKey: getAssessmentQueryKey(variables.programId) })
      toast.success(MESSAGES.ASSESSMENT_CREATED)
    },
    onError: (error: Error) => {
      toast.error(error.message || MESSAGES.ASSESSMENT_CREATE_FAILED)
    },
  })
}

export function useUpdateAssessment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: UpdateAssessmentParams) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error(MESSAGES.NOT_AUTHENTICATED)

      const { data, error } = await supabase
        .from(TABLES.ASSESSMENTS)
        .update({
          title: params.title,
          description: params.description,
          type: params.type,
          due_date: params.dueDate || null,
          max_score: params.maxScore,
        })
        .eq('id', params.assessmentId)
        .select()
        .single()

      if (error) throw error
      return data as Assessment
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: getAssessmentsQueryKey(variables.programId) })
      queryClient.invalidateQueries({ queryKey: getAssessmentQueryKey(variables.assessmentId) })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.ASSESSMENT_ANSWER, variables.assessmentId] })
      toast.success(MESSAGES.ASSESSMENT_UPDATED)
    },
    onError: (error: Error) => {
      toast.error(error.message || MESSAGES.ASSESSMENT_UPDATE_FAILED)
    },
  })
}

export function useSubmitAssessment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: SubmitAssessmentParams) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error(MESSAGES.NOT_AUTHENTICATED)

      const { data, error } = await supabase
        .from(TABLES.ASSESSMENT_SUBMISSIONS)
          .insert({
          assessment_id: params.assessmentId,
            student_id: user.id,
          submission_data: params.submissionData,
          status: params.status || STATUS.SUBMITTED,
          submitted_at: params.status === STATUS.SUBMITTED ? new Date().toISOString() : null,
          })
          .select()
          .single()

      if (error) {
        if (
          error.code === ERROR_CODES.DUPLICATE ||
          error.message?.includes('duplicate') ||
          error.message?.includes('unique')
        ) {
          throw new Error(MESSAGES.ALREADY_SUBMITTED)
        }
        throw error
      }
      return data as AssessmentSubmission
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: getMySubmissionQueryKey(data.assessment_id) })
      queryClient.invalidateQueries({ queryKey: getSubmissionsQueryKey(data.assessment_id) })
      toast.success(MESSAGES.ASSESSMENT_SUBMITTED)
    },
    onError: (error: Error) => {
      toast.error(error.message || MESSAGES.ASSESSMENT_SUBMIT_FAILED)
    },
  })
}

export function useGradeSubmission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: GradeSubmissionParams) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error(MESSAGES.NOT_AUTHENTICATED)

      const { data, error } = await supabase
        .from(TABLES.ASSESSMENT_SUBMISSIONS)
        .update({
          score: params.score,
          feedback: params.feedback,
          graded_by: user.id,
          graded_at: new Date().toISOString(),
          status: STATUS.GRADED,
        })
        .eq('id', params.submissionId)
        .select()
        .single()

      if (error) throw error
      return data as AssessmentSubmission
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: getSubmissionsQueryKey(data.assessment_id) })
      queryClient.invalidateQueries({ queryKey: getMySubmissionQueryKey(data.assessment_id) })
      toast.success(MESSAGES.SUBMISSION_GRADED)
    },
    onError: (error: Error) => {
      toast.error(error.message || MESSAGES.ASSESSMENT_GRADE_FAILED)
    },
  })
}

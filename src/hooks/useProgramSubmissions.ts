import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { AssessmentSubmission } from '@/types'
import { QUERY_KEYS, TABLES, STALE_TIME, SUBMISSION_STATUSES, REFETCH_OPTIONS } from './constants'
import type { QueryOptions } from './interfaces'

export function useProgramSubmissions(programId: string, options?: QueryOptions) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PROGRAM_SUBMISSIONS, programId],
    queryFn: async () => {
      const { data: assessments, error: assessmentsError } = await supabase
        .from(TABLES.ASSESSMENTS)
        .select('id')
        .eq('program_id', programId)

      if (assessmentsError) throw assessmentsError

      if (!assessments || assessments.length === 0) {
        return []
      }

      const assessmentIds = assessments.map((a) => a.id)

      const { data: submissions, error: submissionsError } = await supabase
        .from(TABLES.SUBMISSIONS)
        .select(`
          *,
          student:profiles!assessment_submissions_student_id_fkey(
            id,
            email,
            full_name
          ),
          assessment:assessments!assessment_submissions_assessment_id_fkey(
            id,
            title,
            program_id
          )
        `)
        .in('assessment_id', assessmentIds)
        .in('status', SUBMISSION_STATUSES)
        .order('submitted_at', { ascending: false })

      if (submissionsError) throw submissionsError

      return (submissions || []) as AssessmentSubmission[]
    },
    enabled: options?.enabled !== false && !!programId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}


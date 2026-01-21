import { useQuery } from '@tanstack/react-query'
import { callEdgeFunction } from '@/lib/edgeFunction'
import type { Enrollment } from '@/types'
import { QUERY_KEYS, EDGE_FUNCTIONS } from './constants'
import type { QueryOptions } from './interfaces'

export function useEnrollments(programId?: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ENROLLMENTS, programId],
    queryFn: async () => {
      const response = await callEdgeFunction(EDGE_FUNCTIONS.GET_ENROLLMENTS, {
        programId,
      })
      return (response.enrollments || []) as Enrollment[]
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

export function useMyEnrollments(options?: QueryOptions) {
  return useQuery({
    queryKey: QUERY_KEYS.MY_ENROLLMENTS,
    queryFn: async () => {
      const response = await callEdgeFunction(EDGE_FUNCTIONS.GET_MY_ENROLLMENTS)
      return (response.enrollments || []) as Enrollment[]
    },
    enabled: options?.enabled !== false,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

export function useEnrollment(programId: string, studentId?: string, options?: QueryOptions) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ENROLLMENT, programId, studentId],
    queryFn: async () => {
      const response = await callEdgeFunction(EDGE_FUNCTIONS.GET_ENROLLMENT, {
        programId,
        studentId,
      })
      return (response.enrollment || null) as Enrollment | null
    },
    enabled: options?.enabled !== false && !!programId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}


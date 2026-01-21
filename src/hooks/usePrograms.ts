import { useQuery } from '@tanstack/react-query'
import { callEdgeFunction } from '@/lib/edgeFunction'
import type { Program, ProgramStatus } from '@/types'
import { QUERY_KEYS, EDGE_FUNCTIONS, STALE_TIME, GC_TIME, REFETCH_OPTIONS } from './constants'
import type { QueryOptions } from './interfaces'

export function usePrograms(status?: ProgramStatus, options?: QueryOptions) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PROGRAMS, status],
    queryFn: async () => {
      const response = await callEdgeFunction(EDGE_FUNCTIONS.GET_PROGRAMS, {
        status,
      })
      return (response.programs || []) as Program[]
    },
    enabled: options?.enabled !== false,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

export function useProgram(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PROGRAM, id],
    queryFn: async () => {
      const response = await callEdgeFunction(EDGE_FUNCTIONS.GET_PROGRAM, {
        programId: id,
      })
      return response.program as Program & { mentor?: any }
    },
    enabled: !!id,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

export function useMyPrograms(options?: QueryOptions & { role?: string }) {
  return useQuery({
    queryKey: [...QUERY_KEYS.MY_PROGRAMS, options?.role],
    queryFn: async () => {
      const response = await callEdgeFunction(EDGE_FUNCTIONS.GET_MY_PROGRAMS)
      return (response.programs || []) as Program[]
    },
    enabled: options?.enabled !== false,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}


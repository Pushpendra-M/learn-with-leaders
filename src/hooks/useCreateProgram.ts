import { useMutation, useQueryClient } from '@tanstack/react-query'
import { callEdgeFunction } from '@/lib/edgeFunction'
import type { Program } from '@/types'
import toast from 'react-hot-toast'
import { QUERY_KEYS, EDGE_FUNCTIONS, DEFAULT_MAX_STUDENTS, MESSAGES } from './constants'
import type { CreateProgramParams } from './interfaces'

export function useCreateProgram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: CreateProgramParams) => {
      const response = await callEdgeFunction(EDGE_FUNCTIONS.CREATE_PROGRAM, {
        title: params.title.trim(),
        description: params.description || null,
        startDate: params.startDate || null,
        endDate: params.endDate || null,
        maxStudents: params.maxStudents || DEFAULT_MAX_STUDENTS,
        status: params.status,
        mentorIds: params.mentorIds && params.mentorIds.length > 0 ? params.mentorIds : undefined,
      })
      return response.program as Program
    },
    onSuccess: (newProgram) => {
      queryClient.setQueriesData({ queryKey: QUERY_KEYS.PROGRAMS }, (oldData: any) => {
        if (!oldData) return [newProgram]
        return [newProgram, ...oldData]
      })

      queryClient.setQueriesData({ queryKey: QUERY_KEYS.MY_PROGRAMS }, (oldData: any) => {
        if (!oldData) return [newProgram]
        return [newProgram, ...oldData]
      })

      toast.success(MESSAGES.PROGRAM_CREATED)
    },
    onError: (error: Error) => {
      toast.error(error.message || MESSAGES.PROGRAM_CREATE_FAILED)
    },
  })
}


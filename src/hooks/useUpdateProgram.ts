import { useMutation, useQueryClient } from '@tanstack/react-query'
import { callEdgeFunction } from '@/lib/edgeFunction'
import type { Program } from '@/types'
import toast from 'react-hot-toast'
import { QUERY_KEYS, EDGE_FUNCTIONS, DEFAULT_MAX_STUDENTS, MESSAGES } from './constants'
import type { UpdateProgramParams } from './interfaces'

export function useUpdateProgram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: UpdateProgramParams) => {
      const response = await callEdgeFunction(EDGE_FUNCTIONS.UPDATE_PROGRAM, {
        programId: params.programId,
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
    onSuccess: (updatedProgram) => {
      queryClient.setQueriesData({ queryKey: QUERY_KEYS.PROGRAMS }, (oldData: any) => {
        if (!oldData) return oldData
        return oldData.map((p: Program) => 
          p.id === updatedProgram.id ? updatedProgram : p
        )
      })

      queryClient.setQueriesData({ queryKey: QUERY_KEYS.MY_PROGRAMS }, (oldData: any) => {
        if (!oldData) return oldData
        return oldData.map((p: Program) => 
          p.id === updatedProgram.id ? updatedProgram : p
        )
      })

      queryClient.setQueryData([...QUERY_KEYS.PROGRAM, updatedProgram.id], updatedProgram)

      toast.success(MESSAGES.PROGRAM_UPDATED)
    },
    onError: (error: Error) => {
      toast.error(error.message || MESSAGES.PROGRAM_UPDATE_FAILED)
    },
  })
}


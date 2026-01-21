import { useMutation, useQueryClient } from '@tanstack/react-query'
import { callEdgeFunction } from '@/lib/edgeFunction'
import toast from 'react-hot-toast'
import { QUERY_KEYS, EDGE_FUNCTIONS, MESSAGES } from './constants'

export function useApproveUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await callEdgeFunction(EDGE_FUNCTIONS.APPROVE_USER, {
        userId,
      })
      return response.profile
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_USERS })
      toast.success(MESSAGES.USER_APPROVED)
    },
    onError: (error: Error) => {
      toast.error(error.message || MESSAGES.USER_APPROVE_FAILED)
    },
  })
}


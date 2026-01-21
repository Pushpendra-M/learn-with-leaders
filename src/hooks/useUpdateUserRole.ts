import { useMutation, useQueryClient } from '@tanstack/react-query'
import { callEdgeFunction } from '@/lib/edgeFunction'
import toast from 'react-hot-toast'
import type { UserRole } from '@/types'
import { QUERY_KEYS, EDGE_FUNCTIONS, MESSAGES } from './constants'

export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      const response = await callEdgeFunction(EDGE_FUNCTIONS.UPDATE_USER_ROLE, {
        userId,
        role,
      })
      return response.profile
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_USERS })
      toast.success(MESSAGES.USER_ROLE_UPDATED)
    },
    onError: (error: Error) => {
      toast.error(error.message || MESSAGES.USER_ROLE_UPDATE_FAILED)
    },
  })
}


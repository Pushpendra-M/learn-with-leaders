import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { QUERY_KEYS, TABLES, MESSAGES } from './constants'

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from(TABLES.PROFILES)
        .delete()
        .eq('id', userId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_USERS })
      toast.success(MESSAGES.USER_DELETED)
    },
    onError: (error: Error) => {
      toast.error(error.message || MESSAGES.USER_DELETE_FAILED)
    },
  })
}


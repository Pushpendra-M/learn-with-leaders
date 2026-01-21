import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'
import { QUERY_KEYS, TABLES } from './constants'

export function useAllUsers() {
  return useQuery({
    queryKey: QUERY_KEYS.ALL_USERS,
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLES.PROFILES)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Profile[]
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'
import { QUERY_KEYS, TABLES, MESSAGES } from './constants'

export function useUserProfile(userId?: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PROFILE, userId],
    queryFn: async () => {
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error(MESSAGES.NOT_AUTHENTICATED)
        const { data, error } = await supabase
          .from(TABLES.PROFILES)
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) throw error
        return data as Profile
      }

      const { data, error } = await supabase
        .from(TABLES.PROFILES)
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data as Profile
    },
  })
}


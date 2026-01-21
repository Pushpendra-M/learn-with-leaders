import { QueryClient } from '@tanstack/react-query'
import { QUERY_CLIENT_CONFIG } from './constants'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: QUERY_CLIENT_CONFIG.retry,
      staleTime: QUERY_CLIENT_CONFIG.staleTime,
    },
  },
})


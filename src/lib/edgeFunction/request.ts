import { supabase } from '@/lib/supabase'
import { queryClient } from './client'
import { generateUserToken } from './jwt'
import { getHttpMethod, buildQueryParams, buildFunctionUrl, parseJsonResponse } from './utils'
import { EDGE_FUNCTION_NAME, MESSAGES } from './constants'
import type { EdgeFunctionResponse } from './types'

async function getAuthHeaders(): Promise<{ Authorization: string; 'Content-Type': string; apikey?: string }> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError) {
    throw new Error(MESSAGES.SESSION_ERROR)
  }

  if (!session || !session.user) {
    throw new Error(MESSAGES.NOT_AUTHENTICATED)
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profileError || !profile) {
    throw new Error(MESSAGES.PROFILE_NOT_FOUND)
  }

  const jwtToken = await generateUserToken(session.user.id, profile.role)

  return {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json',
  }
}

export async function makeRequest(
  action: string,
  body: Record<string, any> = {}
): Promise<EdgeFunctionResponse> {
  const headers = await getAuthHeaders()
  const httpMethod = getHttpMethod(action)
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const functionUrl = buildFunctionUrl(supabaseUrl, EDGE_FUNCTION_NAME)

  if (httpMethod === 'GET') {
    const params = buildQueryParams({ action, ...body })
    const url = `${functionUrl}?${params.toString()}`
    
    return queryClient.fetchQuery<EdgeFunctionResponse>({
      queryKey: ['edge-function', action, body],
      queryFn: async () => {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            ...headers,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          },
        })

        return parseJsonResponse(response)
      },
    })
  } else {
    return queryClient.fetchQuery<EdgeFunctionResponse>({
      queryKey: ['edge-function', action, body],
      queryFn: async () => {
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            action,
            ...body,
          }),
        })

        return parseJsonResponse(response)
      },
    })
  }
}


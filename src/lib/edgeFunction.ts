import { useQuery, useMutation } from '@tanstack/react-query'
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'
import { makeRequest } from './edgeFunction/request'
import { MESSAGES } from './edgeFunction/constants'
import type { EdgeFunctionResponse } from './edgeFunction/types'

export type { EdgeFunctionResponse } from './edgeFunction/types'
export { generateUserToken, generateSystemAdminToken } from './edgeFunction/jwt'
export { queryClient } from './edgeFunction/client'

export async function callEdgeFunction(
  action: string,
  body: Record<string, any> = {}
): Promise<EdgeFunctionResponse> {
  try {
    return await makeRequest(action, body)
  } catch (error: any) {
    throw new Error(error.message || MESSAGES.EDGE_FUNCTION_FAILED)
  }
}

export function useEdgeFunctionQuery<T = any>(
  action: string,
  body: Record<string, any> = {},
  options?: Omit<UseQueryOptions<EdgeFunctionResponse<T>, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<EdgeFunctionResponse<T>, Error>({
    queryKey: ['edge-function', action, body],
    queryFn: () => makeRequest(action, body),
    ...options,
  })
}

export function useEdgeFunctionMutation<TData = any, TVariables = Record<string, any>>(
  action: string,
  options?: Omit<UseMutationOptions<EdgeFunctionResponse<TData>, Error, TVariables>, 'mutationFn'>
) {
  return useMutation<EdgeFunctionResponse<TData>, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      return makeRequest(action, variables as Record<string, any>)
    },
    ...options,
  })
}

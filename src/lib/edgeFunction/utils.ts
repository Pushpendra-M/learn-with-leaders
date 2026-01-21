import { GET_ACTIONS } from './constants'

export function getHttpMethod(action: string): 'GET' | 'POST' {
  return GET_ACTIONS.includes(action as any) ? 'GET' : 'POST'
}

export function buildQueryParams(body: Record<string, any>): URLSearchParams {
  return new URLSearchParams({
    ...Object.fromEntries(
      Object.entries(body)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => [
          key,
          typeof value === 'object' ? JSON.stringify(value) : String(value)
        ])
    ),
  })
}

export function buildFunctionUrl(supabaseUrl: string, functionName: string): string {
  return `${supabaseUrl}/functions/v1/${functionName}`
}

export async function parseJsonResponse(response: Response): Promise<any> {
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error')
    throw new Error(`HTTP ${response.status}: ${errorText}`)
  }

  try {
    return await response.json()
  } catch {
    throw new Error('Invalid JSON response')
  }
}


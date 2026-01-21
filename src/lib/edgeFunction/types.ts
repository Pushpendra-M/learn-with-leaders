export interface EdgeFunctionResponse<T = any> {
  success?: boolean
  error?: string
  details?: string
  data?: T
  [key: string]: any
}


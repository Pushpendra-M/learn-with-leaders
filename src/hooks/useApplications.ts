import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { callEdgeFunction } from '@/lib/edgeFunction'
import type { Application } from '@/types'
import toast from 'react-hot-toast'
import { QUERY_KEYS, EDGE_FUNCTIONS, MESSAGES } from './constants'
import type { CreateApplicationParams, ReviewApplicationParams, QueryOptions } from './interfaces'

export function useApplications(programId?: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.APPLICATIONS, programId],
    queryFn: async () => {
      const response = await callEdgeFunction(EDGE_FUNCTIONS.GET_APPLICATIONS, {
        programId,
      })
      return (response.applications || []) as Application[]
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

export function useMyApplications(options?: QueryOptions) {
  return useQuery({
    queryKey: QUERY_KEYS.MY_APPLICATIONS,
    queryFn: async () => {
      const response = await callEdgeFunction(EDGE_FUNCTIONS.GET_MY_APPLICATIONS)
      return (response.applications || []) as Application[]
    },
    enabled: options?.enabled !== false,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.APPLICATION, id],
    queryFn: async () => {
      const response = await callEdgeFunction(EDGE_FUNCTIONS.GET_APPLICATIONS)
      const application = (response.applications || []).find((app: Application) => app.id === id)
      if (!application) throw new Error(MESSAGES.APPLICATION_NOT_FOUND)
      return application as Application
    },
    enabled: !!id,
  })
}

export function useApplicationByProgram(programId: string) {
  const { data: myApplications, isLoading, error } = useMyApplications()
  
  return {
    data: myApplications?.find((app: Application) => app.program_id === programId) || null,
    isLoading,
    error,
  }
}

export function useCreateApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: CreateApplicationParams) => {
      const response = await callEdgeFunction(EDGE_FUNCTIONS.CREATE_APPLICATION, {
        programId: params.programId,
        applicationData: params.applicationData,
      })
      return response.application as Application
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPLICATIONS })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_APPLICATIONS })
      toast.success(MESSAGES.APPLICATION_SUBMITTED)
    },
    onError: (error: Error) => {
      toast.error(error.message || MESSAGES.SUBMIT_FAILED)
    },
  })
}

export function useReviewApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: ReviewApplicationParams) => {
      const response = await callEdgeFunction(EDGE_FUNCTIONS.REVIEW_APPLICATION, {
        applicationId: params.applicationId,
        reviewAction: params.action,
      })
      return { ...response, applicationId: params.applicationId, action: params.action }
    },
    onMutate: async ({ applicationId, action }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.APPLICATIONS })

      const previousApplications = queryClient.getQueriesData<Application[]>({
        queryKey: QUERY_KEYS.APPLICATIONS,
      })

      previousApplications.forEach(([queryKey, applications]) => {
        if (applications) {
          const updatedApplications = applications.map((app) =>
            app.id === applicationId
              ? {
                  ...app,
                  status: action === 'approve' ? ('approved' as const) : ('rejected' as const),
                  reviewed_at: new Date().toISOString(),
                }
              : app
          )
          queryClient.setQueryData(queryKey, updatedApplications)
        }
      })

      return { previousApplications }
    },
    onSuccess: (response, variables) => {
      const updatedApplication = (response as any)?.application as Application | undefined
      
      const allQueries = queryClient.getQueriesData<Application[]>({
        queryKey: QUERY_KEYS.APPLICATIONS,
      })

      allQueries.forEach(([queryKey, applications]) => {
        if (applications) {
          const updatedApplications = applications.map((app) => {
            if (app.id === variables.applicationId) {
              return updatedApplication || {
                ...app,
                status: variables.action === 'approve' ? ('approved' as const) : ('rejected' as const),
                reviewed_at: new Date().toISOString(),
              }
            }
            return app
          })
          queryClient.setQueryData(queryKey, updatedApplications)
        }
      })

      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ENROLLMENTS })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRAMS })
      toast.success(MESSAGES.APPLICATION_REVIEWED)
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousApplications) {
        context.previousApplications.forEach(([queryKey, applications]) => {
          if (applications) {
            queryClient.setQueryData(queryKey, applications)
          }
        })
      }
      toast.error(error.message || MESSAGES.REVIEW_FAILED)
    },
  })
}


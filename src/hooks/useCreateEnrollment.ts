import { useMutation, useQueryClient } from '@tanstack/react-query'
import { callEdgeFunction } from '@/lib/edgeFunction'
import toast from 'react-hot-toast'
import type { Application } from '@/types'
import { QUERY_KEYS, EDGE_FUNCTIONS, TEMP_ID_PREFIX, APPLICATION_STATUS, MESSAGES } from './constants'

export function useCreateEnrollment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (programId: string) => {
      const response = await callEdgeFunction(EDGE_FUNCTIONS.CREATE_ENROLLMENT, {
        programId,
      })
      return { data: response.enrollment || response.application, message: response.message }
    },
    onMutate: async (programId: string) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.MY_APPLICATIONS })

      const previousApplications = queryClient.getQueryData<Application[]>(QUERY_KEYS.MY_APPLICATIONS)

      const tempId = `${TEMP_ID_PREFIX}${programId}`
      const optimisticApplication: Application = {
        id: tempId,
        program_id: programId,
        student_id: '',
        status: APPLICATION_STATUS.PENDING,
        application_data: {},
        submitted_at: new Date().toISOString(),
        reviewed_at: null,
        reviewed_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      queryClient.setQueryData<Application[]>(QUERY_KEYS.MY_APPLICATIONS, (old = []) => {
        const exists = old.some((app) => app.program_id === programId)
        if (exists) {
          return old
        }
        return [optimisticApplication, ...old]
      })

      return { previousApplications, tempId }
    },
    onSuccess: (result: { data: any; message?: string }, programId: string, context) => {
      if (result.data && result.data.program_id) {
        const application = result.data as Application
        queryClient.setQueryData<Application[]>(QUERY_KEYS.MY_APPLICATIONS, (old = []) => {
          const filtered = old.filter((app) => {
            return app.id !== context?.tempId && app.program_id !== programId
          })
          return [application, ...filtered]
        })
      }

      if (result.data && result.data.enrolled_at) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_ENROLLMENTS })
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ENROLLMENTS })
      }
      
      if (result.message) {
        toast.success(result.message)
      } else {
        toast.success(MESSAGES.ENROLLMENT_SUCCESS)
      }
    },
    onError: (error: Error, _programId: string, context) => {
      if (context?.previousApplications) {
        queryClient.setQueryData(QUERY_KEYS.MY_APPLICATIONS, context.previousApplications)
      }
      toast.error(error.message || MESSAGES.ENROLLMENT_FAILED)
    },
  })
}

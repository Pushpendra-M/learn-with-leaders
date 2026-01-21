import type { Application } from '@/types'
import type { FilterStatus } from './constants'

export const filterApplications = (
  applications: Application[] | undefined,
  filterStatus: FilterStatus
): Application[] => {
  if (!applications) return []
  if (filterStatus === 'all') return applications
  return applications.filter((app) => app.status === filterStatus)
}

export const groupApplicationsByProgram = (
  applications: Application[]
): Record<string, Application[]> => {
  return applications.reduce((acc: Record<string, Application[]>, app: Application) => {
    const programId = app.program_id
    if (!acc[programId]) {
      acc[programId] = []
    }
    acc[programId].push(app)
    return acc
  }, {})
}

export const getStatusCounts = (applications: Application[] | undefined) => {
  if (!applications) {
    return { all: 0, pending: 0, approved: 0, rejected: 0 }
  }
  return {
    all: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    approved: applications.filter((a) => a.status === 'approved').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  }
}


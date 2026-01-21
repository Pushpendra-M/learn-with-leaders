import type { Program, Application, Enrollment } from '@/types'
import { formatDateShort } from '@/utils/date'

export const filterProgramsForStudent = (programs: Program[] | undefined): Program[] => {
  if (!programs) return []
  return programs.filter((program: Program) => {
    const status = program.status || 'draft'
    const isOpen = status === 'open'
    const isFull = program.max_students
      ? (program.enrollments_count || 0) >= program.max_students
      : false
    return isOpen && !isFull
  })
}

export const getProgramStatus = (
  programId: string,
  enrollmentMap: Map<string, Enrollment>,
  applicationMap: Map<string, Application>
): { type: 'enrolled' } | { type: 'applied'; status: string } | { type: 'available'; status: null } => {
  const enrollment = enrollmentMap.get(programId)
  if (enrollment) {
    return { type: 'enrolled' as const }
  }
  const application = applicationMap.get(programId) as Application | undefined
  if (application) {
    return { type: 'applied' as const, status: application.status }
  }
  return { type: 'available' as const, status: null }
}

export const getStudentStatusLabel = (
  programStatus: ReturnType<typeof getProgramStatus>,
  application: Application | undefined,
  program: Program
): string => {
  if (programStatus.type === 'enrolled') {
    return 'Enrolled'
  }
  if (programStatus.type === 'applied') {
    if (application?.status === 'pending') {
      return 'Application Pending'
    }
    if (application?.status === 'approved') {
      return 'Application Approved'
    }
    return 'Application Rejected'
  }
  return program.status === 'open' ? 'Available' : program.status || 'Draft'
}

export const getInitials = (fullName: string | null, email: string | null): string => {
  if (fullName) {
    return fullName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  return email?.[0]?.toUpperCase() || 'M'
}

export const formatProgramDate = (dateString: string | null): string => {
  if (!dateString) return 'TBD'
  return formatDateShort(dateString)
}


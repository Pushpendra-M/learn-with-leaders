export const APPLICATION_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
} as const

export const FILTER_STATUSES = ['all', 'pending', 'approved', 'rejected'] as const

export type FilterStatus = (typeof FILTER_STATUSES)[number]


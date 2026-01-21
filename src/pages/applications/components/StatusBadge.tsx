import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { APPLICATION_STATUS_COLORS } from '../constants'

interface StatusBadgeProps {
  status: string
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: APPLICATION_STATUS_COLORS.pending,
          label: 'Pending',
        }
      case 'approved':
        return {
          icon: CheckCircle,
          color: APPLICATION_STATUS_COLORS.approved,
          label: 'Approved',
        }
      case 'rejected':
        return {
          icon: XCircle,
          color: APPLICATION_STATUS_COLORS.rejected,
          label: 'Rejected',
        }
      default:
        return null
    }
  }

  const config = getStatusConfig()
  if (!config) return null

  const Icon = config.icon

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  )
}


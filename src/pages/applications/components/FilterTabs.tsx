import type { FilterStatus } from '../constants'
import { getStatusCounts } from '../utils'
import type { Application } from '@/types'

interface FilterTabsProps {
  applications: Application[] | undefined
  filterStatus: FilterStatus
  onFilterChange: (status: FilterStatus) => void
}

export default function FilterTabs({ applications, filterStatus, onFilterChange }: FilterTabsProps) {
  const counts = getStatusCounts(applications)

  const tabs = [
    { status: 'all' as const, label: 'All', count: counts.all },
    { status: 'pending' as const, label: 'Pending', count: counts.pending },
    { status: 'approved' as const, label: 'Approved', count: counts.approved },
    { status: 'rejected' as const, label: 'Rejected', count: counts.rejected },
  ]

  return (
    <div className="mb-6 flex gap-2 border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.status}
          onClick={() => onFilterChange(tab.status)}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filterStatus === tab.status
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label} ({tab.count})
        </button>
      ))}
    </div>
  )
}


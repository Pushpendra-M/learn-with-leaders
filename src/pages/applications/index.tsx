import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useApplications, useReviewApplication } from '@/hooks/useApplications'
import Loading from '@/components/common/Loading'
import FilterTabs from './components/FilterTabs'
import ApplicationCard from './components/ApplicationCard'
import { filterApplications, groupApplicationsByProgram } from './utils'
import type { FilterStatus } from './constants'

export default function Applications() {
  const { profile, loading: authLoading } = useAuth()
  const { data: applications, isLoading } = useApplications()
  const reviewApplication = useReviewApplication()
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')

  const isLoadingData = authLoading || isLoading

  const filteredApplications = filterApplications(applications, filterStatus)
  const applicationsByProgram = groupApplicationsByProgram(filteredApplications)

  const handleReview = async (applicationId: string, action: 'approve' | 'reject') => {
    await reviewApplication.mutateAsync({ applicationId, action })
  }

  if (isLoadingData) {
    return <Loading loading={true} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
          <p className="mt-2 text-gray-600">
            {profile?.role === 'admin'
              ? 'Review and manage all program applications'
              : 'Review applications for your programs'}
          </p>
        </div>

        <FilterTabs
          applications={applications}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
        />

        {filteredApplications.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(applicationsByProgram).map(([programId, programApplications]) => (
              <ApplicationCard
                key={programId}
                programId={programId}
                applications={programApplications}
                isReviewing={reviewApplication.isPending}
                onReview={handleReview}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">
              {filterStatus === 'all'
                ? 'No applications found.'
                : `No ${filterStatus} applications found.`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}


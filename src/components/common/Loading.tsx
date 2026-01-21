import { useEffect, useState } from 'react'

interface LoadingProps {
  loading: boolean
}

export default function Loading({ loading }: LoadingProps) {
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setShowError(true)
      }, 5000)
      return () => clearTimeout(timer)
    } else {
      setShowError(false)
    }
  }, [loading])

  if (!loading) return null

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
        {showError && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md mx-auto">
            <p className="text-sm text-yellow-800">
              Taking longer than expected. Check your browser console for errors.
            </p>
            <p className="text-xs text-yellow-600 mt-2">
              Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file
            </p>
          </div>
        )}
      </div>
    </div>
  )
}


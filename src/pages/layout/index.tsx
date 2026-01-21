import { useAuth } from '@/contexts/AuthContext'
import { useNavigate, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import Navigation from './components/Navigation'
import UserMenu from './components/UserMenu'
import { ROUTES } from '@/routes/constants'

interface HomeProps {
  children: ReactNode
}

export default function Home({ children }: HomeProps) {
  const { user, profile, signOut, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && profile && profile.role !== 'admin' && profile.is_approved !== true) {
      navigate(ROUTES.WAITING_APPROVAL, { replace: true })
    }
  }, [profile, loading, navigate])

  if (!loading && profile && profile.role !== 'admin' && profile.is_approved !== true) {
    return <Navigate to={ROUTES.WAITING_APPROVAL} replace />
  }

  const handleSignOut = async () => {
    await signOut()
    navigate(ROUTES.SIGN_IN)
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <nav className="bg-white shadow flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Navigation profile={profile} />
            </div>
            <UserMenu user={user} profile={profile} onSignOut={handleSignOut} />
          </div>
        </div>
      </nav>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}


import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import SignIn from '@/pages/auth/signin'
import SignUp from '@/pages/auth/signup'
import Home from '@/pages/layout'
import ProgramList from '@/pages/programs/list'
import ProgramDetail from '@/pages/programs/detail'
import AssessmentDetail from '@/pages/assessments'
import AdminUsers from '@/pages/admin/users'
import Applications from '@/pages/applications'
import WaitingApproval from '@/pages/auth/waiting-approval'
import ProtectedRoute from '@/components/routes/ProtectedRoute'
import { ROUTES } from './constants'

export default function AppRoutes() {
  const { user, profile } = useAuth()

  const shouldRedirectToWaiting = user && profile && profile.role !== 'admin' && profile.is_approved !== true

  return (
    <Routes>
      <Route
        path={ROUTES.SIGN_IN}
        element={
          user ? (
            shouldRedirectToWaiting ? (
              <Navigate to={ROUTES.WAITING_APPROVAL} replace />
            ) : (
              <Navigate to={ROUTES.PROGRAMS} replace />
            )
          ) : (
            <SignIn />
          )
        }
      />
      <Route
        path={ROUTES.SIGN_UP}
        element={
          user ? (
            shouldRedirectToWaiting ? (
              <Navigate to={ROUTES.WAITING_APPROVAL} replace />
            ) : (
              <Navigate to={ROUTES.PROGRAMS} replace />
            )
          ) : (
            <SignUp />
          )
        }
      />
      <Route
        path={ROUTES.WAITING_APPROVAL}
        element={user ? <WaitingApproval /> : <Navigate to={ROUTES.SIGN_IN} replace />}
      />
      <Route
        path={ROUTES.HOME}
        element={
          <ProtectedRoute>
            <Navigate to={ROUTES.PROGRAMS} replace />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PROGRAMS}
        element={
          <ProtectedRoute>
            <Home>
              <ProgramList />
            </Home>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PROGRAM_DETAIL}
        element={
          <ProtectedRoute>
            <Home>
              <ProgramDetail />
            </Home>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ASSESSMENT_DETAIL}
        element={
          <ProtectedRoute>
            <Home>
              <AssessmentDetail />
            </Home>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_USERS}
        element={
          <ProtectedRoute>
            <Home>
              <AdminUsers />
            </Home>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.APPLICATIONS}
        element={
          <ProtectedRoute>
            <Home>
              <Applications />
            </Home>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.NOT_FOUND}
        element={
          user ? (
            shouldRedirectToWaiting ? (
              <Navigate to={ROUTES.WAITING_APPROVAL} replace />
            ) : (
              <ProtectedRoute>
                <Navigate to={ROUTES.PROGRAMS} replace />
              </ProtectedRoute>
            )
          ) : (
            <Navigate to={ROUTES.SIGN_IN} replace />
          )
        }
      />
    </Routes>
  )
}
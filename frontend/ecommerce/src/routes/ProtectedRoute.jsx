import { Navigate, Outlet, useLocation } from 'react-router-dom'
import LoadingState from '../components/common/LoadingState'
import { useAuth } from '../context/useAuth'

function ProtectedRoute() {
  const { isAuthenticated, initializing } = useAuth()
  const location = useLocation()

  if (initializing) return <LoadingState />
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

export default ProtectedRoute
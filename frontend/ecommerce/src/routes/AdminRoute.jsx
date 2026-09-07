import { Navigate, Outlet, useLocation } from 'react-router-dom'
import LoadingState from '../components/common/LoadingState'
import { useAuth } from '../context/useAuth'

function AdminRoute() {
  const { user, initializing } = useAuth()
  const location = useLocation()

  if (initializing) return <LoadingState />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (user.role !== 'admin') return <Navigate to="/" replace state={{ forbidden: true }} />
  return <Outlet />
}

export default AdminRoute
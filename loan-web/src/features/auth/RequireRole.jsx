import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession } from './hooks.js'

function RequireRole({ allow, children }) {
  const { isAuthenticated, isLoading, role } = useSession()
  const location = useLocation()

  if (isLoading) return <div className="session-splash" />

  if (!isAuthenticated)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />

  if (allow && !allow.includes(role))
    return <Navigate to="/" replace />

  return children ?? <Outlet />
}

export default RequireRole

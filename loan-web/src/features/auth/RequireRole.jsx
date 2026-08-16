import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession } from './hooks.js'

/**
 * Gates a route on the JWT role. This is a rendering convenience only —
 * the API re-checks every request, so a forged token gains nothing.
 *
 * Wraps `children` when given, otherwise renders an <Outlet /> so it can be
 * used as a pathless layout route.
 */
function RequireRole({ allow, children }) {
  const { isAuthenticated, role } = useSession()
  const location = useLocation()

  if (!isAuthenticated)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />

  if (allow && !allow.includes(role))
    return <Navigate to="/" replace />

  return children ?? <Outlet />
}

export default RequireRole

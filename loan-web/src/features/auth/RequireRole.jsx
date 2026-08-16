import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession } from './hooks.js'

/**
 * Gates a route on the session role. This is a rendering convenience only —
 * the API re-checks every request, so a forged claim gains nothing.
 *
 * Wraps `children` when given, otherwise renders an <Outlet /> so it can be
 * used as a pathless layout route.
 */
function RequireRole({ allow, children }) {
  const { isAuthenticated, isLoading, role } = useSession()
  const location = useLocation()

  // Until /Auth/me answers, "not authenticated" is unknown rather than false.
  // Redirecting here would bounce every signed-in user through /login on each
  // reload and lose the deep link they arrived on.
  if (isLoading) return <div className="session-splash" />

  if (!isAuthenticated)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />

  if (allow && !allow.includes(role))
    return <Navigate to="/" replace />

  return children ?? <Outlet />
}

export default RequireRole

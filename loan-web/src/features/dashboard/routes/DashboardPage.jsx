import { useSession } from '../../auth/index.js'
import BorrowerDashboard from '../components/BorrowerDashboard.jsx'
import StaffDashboard from '../components/StaffDashboard.jsx'
import { configFor } from '../roleConfig.js'
import './DashboardPage.css'

function UnconfiguredRole({ role }) {
  return (
    <header>
      <h1 className="heading">No dashboard for this role</h1>
      <p className="muted">
        The {role ?? 'unknown'} role has no dashboard configured.
      </p>
    </header>
  )
}

/**
 * Picks the dashboard body from the role's config kind, never from the role
 * itself — adding a role means adding a roleConfig entry, not a branch here
 * (rule 17).
 */
export function DashboardPage() {
  const { role } = useSession()
  const config = configFor(role)

  if (!config) return <UnconfiguredRole role={role} />

  return config.kind === 'self' ? (
    <BorrowerDashboard config={config} />
  ) : (
    <StaffDashboard config={config} />
  )
}

export default DashboardPage

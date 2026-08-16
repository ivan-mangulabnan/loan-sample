import { ROLES } from '../../../lib/roles.js'
import { useSession } from '../../auth/index.js'
import AllApplications from '../components/AllApplications.jsx'
import MyApplications from '../components/MyApplications.jsx'

/**
 * Both audiences reach /applications, so the route is not role-gated — the body
 * is. A borrower sees their own records, staff see the tenancy. Each child calls
 * an endpoint the other's role cannot, which is where the real boundary sits
 * (rule 18): this only decides what to render.
 */
export function ApplicationsPage() {
  const { role } = useSession()

  return role === ROLES.Loaner ? <MyApplications /> : <AllApplications />
}

export default ApplicationsPage

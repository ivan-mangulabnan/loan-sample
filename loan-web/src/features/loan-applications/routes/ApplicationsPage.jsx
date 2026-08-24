import { ROLES } from '../../../lib/roles.js'
import { useSession } from '../../auth/index.js'
import AllApplications from '../components/AllApplications.jsx'
import MyApplications from '../components/MyApplications.jsx'

export function ApplicationsPage() {
  const { role } = useSession()

  return role === ROLES.Loaner ? <MyApplications /> : <AllApplications />
}

export default ApplicationsPage

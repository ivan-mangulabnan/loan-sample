import ApplicationStatusBadge from '../components/ApplicationStatusBadge.jsx'
import { useMyApplications } from '../hooks.js'

export function ApplicationListPage() {
  const { data, error, isLoading } = useMyApplications()

  if (isLoading) return <p>Loading…</p>
  if (error) return <p>Could not load applications: {error.message}</p>

  return (
    <section>
      <h1>My Applications</h1>
      <ul>
        {(data ?? []).map((application) => (
          <li key={application.id}>
            #{application.id} <ApplicationStatusBadge status={application.status} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export default ApplicationListPage

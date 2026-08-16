import Button from '../../../components/Button.jsx'
import { QueueTable } from '../../dashboard/index.js'
import { useAllApplications } from '../hooks.js'

/**
 * Every application in the tenant, at any status. The queue endpoints each show
 * one stage only, so this is the sole place staff see an application's history.
 */
function AllApplications() {
  const { data, error, isLoading, reload } = useAllApplications()
  const rows = data ?? []

  return (
    <>
      <header className="page-head">
        <div>
          <h1 className="heading">All applications</h1>
          <p className="muted">Every application in your tenancy, any status</p>
        </div>
        <Button size="sm" onClick={reload}>
          Refresh
        </Button>
      </header>

      {error ? (
        <p className="muted">Could not load: {error.message}</p>
      ) : isLoading ? (
        <p className="muted">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="muted">No applications have been submitted yet.</p>
      ) : (
        <QueueTable shape="application" rows={rows} />
      )}
    </>
  )
}

export default AllApplications

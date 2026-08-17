import Button from '../../../components/Button.jsx'
import { QueueTable } from '../../dashboard/index.js'
import { useMyApplications } from '../hooks.js'

/** The signed-in borrower's own applications. */
function MyApplications() {
  const { data, error, isLoading, reload } = useMyApplications()
  const rows = data ?? []

  return (
    <>
      <header className="page-head">
        <div>
          <h1 className="heading">My applications</h1>
          <p className="muted">Everything you have applied for</p>
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
        <p className="muted">You have not applied for a loan yet.</p>
      ) : (
        // hideBorrower: the endpoint does not include it, and it is the reader.
        <QueueTable shape="application" rows={rows} hideBorrower />
      )}
    </>
  )
}

export default MyApplications

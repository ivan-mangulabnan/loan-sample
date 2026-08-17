import Button from '../../../components/Button.jsx'
import { QueueTable, configFor, useRoleQueue } from '../../dashboard/index.js'
import { useSession } from '../../auth/index.js'

/**
 * Approval decisions: applications at PENDING_APPROVAL, already reviewed. Its
 * own component rather than a shared queue page — approving is not reviewing,
 * and the decision action will live here.
 */
export function ApprovalsPage() {
  const { role } = useSession()
  const config = configFor(role)
  const queue = useRoleQueue(config?.queue)

  const rows = queue.data ?? []

  return (
    <>
      <header className="page-head">
        <div>
          <h1 className="heading">Approval queue</h1>
          <p className="muted">Reviewed applications awaiting a decision</p>
        </div>
        <Button size="sm" onClick={queue.reload}>
          Refresh
        </Button>
      </header>

      {queue.error ? (
        <p className="muted">Could not load: {queue.error.message}</p>
      ) : queue.isLoading ? (
        <p className="muted">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="muted">No applications are waiting for approval.</p>
      ) : (
        <QueueTable shape="application" rows={rows} />
      )}
    </>
  )
}

export default ApprovalsPage

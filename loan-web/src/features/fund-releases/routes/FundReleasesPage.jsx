import Button from '../../../components/Button.jsx'
import { QueueTable, configFor, useRoleQueue } from '../../dashboard/index.js'
import { useSession } from '../../auth/index.js'

/**
 * Disbursement: approved loans at PENDING_RELEASE. Rows are
 * FundReleaseQueueResponse[] — a different shape from the two application
 * queues, which is why this area cannot share their columns.
 */
export function FundReleasesPage() {
  const { role } = useSession()
  const config = configFor(role)
  const queue = useRoleQueue(config?.queue)

  const rows = queue.data ?? []

  return (
    <>
      <header className="page-head">
        <div>
          <h1 className="heading">Fund release</h1>
          <p className="muted">Approved loans awaiting disbursement</p>
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
        <p className="muted">Nothing is waiting for release.</p>
      ) : (
        <QueueTable shape="release" rows={rows} />
      )}
    </>
  )
}

export default FundReleasesPage

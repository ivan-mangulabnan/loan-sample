import Button from '../../../components/Button.jsx'
import { QueueTable, configFor, useRoleQueue } from '../../dashboard/index.js'
import { useSession } from '../../auth/index.js'

/**
 * First-pass review: applications at PENDING_REVIEW. Its own component rather
 * than a shared queue page, so the URL means this area and the review action has
 * somewhere to land when it is built.
 */
export function ReviewPage() {
  const { role } = useSession()
  const config = configFor(role)
  const queue = useRoleQueue(config?.queue)

  const rows = queue.data ?? []

  return (
    <>
      <header className="page-head">
        <div>
          <h1 className="heading">Review queue</h1>
          <p className="muted">Applications awaiting first-pass review</p>
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
        <p className="muted">No applications are waiting for review.</p>
      ) : (
        <QueueTable shape="application" rows={rows} />
      )}
    </>
  )
}

export default ReviewPage

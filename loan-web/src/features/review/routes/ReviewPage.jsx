import Button from '../../../components/Button.jsx'
import { useListQuery } from '../../../hooks/useListQuery.js'
import { ListView, QueueTable, configFor, useRoleQueue } from '../../dashboard/index.js'
import { useSession } from '../../auth/index.js'

/**
 * First-pass review: applications at PENDING_REVIEW. Its own component rather
 * than a shared queue page, so the URL means this area and the review action has
 * somewhere to land when it is built.
 *
 * No status filter: the endpoint is pinned to one stage server-side, so a dropdown
 * here could only ever offer the stage the reader is already looking at.
 */
export function ReviewPage() {
  const { role } = useSession()
  const config = configFor(role)
  const [query, onQueryChange] = useListQuery()
  const queue = useRoleQueue(config?.queue, query)

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

      <ListView
        query={query}
        onQueryChange={onQueryChange}
        result={queue.data}
        isLoading={queue.isLoading}
        error={queue.error}
        emptyMessage="No applications are waiting for review."
        searchPlaceholder="Search by reference or borrower name"
        searchLabel="Search the review queue"
      >
        {(rows) => <QueueTable shape="application" rows={rows} />}
      </ListView>
    </>
  )
}

export default ReviewPage

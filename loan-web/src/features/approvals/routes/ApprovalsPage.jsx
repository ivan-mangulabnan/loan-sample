import Button from '../../../components/Button.jsx'
import { useListQuery } from '../../../hooks/useListQuery.js'
import { ListView, QueueTable, configFor, useRoleQueue } from '../../dashboard/index.js'
import { useSession } from '../../auth/index.js'

/**
 * Approval decisions: applications at PENDING_APPROVAL, already reviewed. Its
 * own component rather than a shared queue page — approving is not reviewing,
 * and the decision action will live here.
 *
 * No status filter: the endpoint is pinned to one stage server-side.
 */
export function ApprovalsPage() {
  const { role } = useSession()
  const config = configFor(role)
  const [query, onQueryChange] = useListQuery()
  const queue = useRoleQueue(config?.queue, query)

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

      <ListView
        query={query}
        onQueryChange={onQueryChange}
        items={queue.data}
        isLoading={queue.isLoading}
        error={queue.error}
        emptyMessage="No applications are waiting for approval."
        searchPlaceholder="Search by reference or borrower name"
        searchLabel="Search the approval queue"
      >
        {(rows) => <QueueTable shape="application" rows={rows} />}
      </ListView>
    </>
  )
}

export default ApprovalsPage

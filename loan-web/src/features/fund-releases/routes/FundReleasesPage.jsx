import Button from '../../../components/Button.jsx'
import { useListQuery } from '../../../hooks/useListQuery.js'
import { ListView, QueueTable, configFor, useRoleQueue } from '../../dashboard/index.js'
import { useSession } from '../../auth/index.js'

/**
 * Disbursement: approved loans at PENDING_RELEASE. Rows are
 * FundReleaseQueueResponse[] — a different shape from the two application
 * queues, which is why this area cannot share their columns.
 *
 * No status filter: the endpoint is pinned to one stage server-side. Search still
 * matches the *application's* reference, which is the number the table prints.
 */
export function FundReleasesPage() {
  const { role } = useSession()
  const config = configFor(role)
  const [query, onQueryChange] = useListQuery()
  const queue = useRoleQueue(config?.queue, query)

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

      <ListView
        query={query}
        onQueryChange={onQueryChange}
        items={queue.data}
        isLoading={queue.isLoading}
        error={queue.error}
        emptyMessage="Nothing is waiting for release."
        searchPlaceholder="Search by reference or borrower name"
        searchLabel="Search the release queue"
      >
        {(rows) => <QueueTable shape="release" rows={rows} />}
      </ListView>
    </>
  )
}

export default FundReleasesPage

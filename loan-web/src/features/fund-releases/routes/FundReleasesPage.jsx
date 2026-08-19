import { useCallback } from 'react'
import Button from '../../../components/Button.jsx'
import Callout from '../../../components/Callout.jsx'
import { useListQuery } from '../../../hooks/useListQuery.js'
import { useWriteAction } from '../../../hooks/useWriteAction.js'
import { ListView, QueueTable, configFor, useRoleQueue } from '../../dashboard/index.js'
import { useSession } from '../../auth/index.js'
import ReleaseModal from '../components/ReleaseModal.jsx'
import { decideRelease } from '../api.js'

/**
 * Disbursement: approved loans at PENDING_RELEASE, which the admin either funds or
 * refuses. Rows are FundReleaseQueueResponse[] — a different shape from the two
 * application queues, which is why this area cannot share their columns, and why the
 * release dialog is its own component rather than a DecisionModal.
 *
 * No status filter: the endpoint is pinned to one stage server-side. Search still
 * matches the *application's* reference, which is the number the table prints.
 */
export function FundReleasesPage() {
  const { role } = useSession()
  const config = configFor(role)
  const [query, onQueryChange] = useListQuery()
  const queue = useRoleQueue(config?.queue, query)

  // Keyed on the approval, not the application: the sum at stake is the principal the
  // approver settled on. The decision comes from the dialog and is always present.
  const send = useCallback(
    (release, { decision, remarks }) =>
      decideRelease({ loanApprovalId: release.loanApprovalId, decision, remarks }),
    [],
  )

  const release = useWriteAction(send, queue.reload)

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

      {release.notice && (
        <Callout onDismiss={release.dismissNotice}>{release.notice}</Callout>
      )}

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
        {(rows) => (
          <QueueTable
            shape="release"
            rows={rows}
            actionLabel="Decide"
            onAction={release.open}
          />
        )}
      </ListView>

      <ReleaseModal
        key={release.target?.loanApprovalId}
        release={release.target}
        onSubmit={release.run}
        onClose={release.close}
        isSubmitting={release.isSubmitting}
        error={release.error}
      />
    </>
  )
}

export default FundReleasesPage

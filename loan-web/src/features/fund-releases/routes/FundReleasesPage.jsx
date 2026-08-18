import { useCallback } from 'react'
import Button from '../../../components/Button.jsx'
import Callout from '../../../components/Callout.jsx'
import { useListQuery } from '../../../hooks/useListQuery.js'
import { useWriteAction } from '../../../hooks/useWriteAction.js'
import { ListView, QueueTable, configFor, useRoleQueue } from '../../dashboard/index.js'
import { useSession } from '../../auth/index.js'
import ReleaseModal from '../components/ReleaseModal.jsx'
import { releaseFunds } from '../api.js'

/**
 * Disbursement: approved loans at PENDING_RELEASE. Rows are
 * FundReleaseQueueResponse[] — a different shape from the two application
 * queues, which is why this area cannot share their columns, and why the release
 * dialog is its own component rather than a DecisionModal with one button.
 *
 * No status filter: the endpoint is pinned to one stage server-side. Search still
 * matches the *application's* reference, which is the number the table prints.
 */
export function FundReleasesPage() {
  const { role } = useSession()
  const config = configFor(role)
  const [query, onQueryChange] = useListQuery()
  const queue = useRoleQueue(config?.queue, query)

  // Keyed on the approval, not the application: the sum released is the principal the
  // approver settled on.
  const send = useCallback(
    (release, { remarks }) =>
      releaseFunds({ loanApprovalId: release.loanApprovalId, remarks }),
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
            actionLabel="Release"
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

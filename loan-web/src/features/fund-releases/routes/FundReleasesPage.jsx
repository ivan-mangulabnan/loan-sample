import { useCallback } from 'react'
import Button from '../../../components/Button.jsx'
import { useListQuery } from '../../../hooks/useListQuery.js'
import { useWriteAction } from '../../../hooks/useWriteAction.js'
import { ListView, QueueTable, configFor, useRoleQueue } from '../../dashboard/index.js'
import { useSession } from '../../auth/index.js'
import ReleaseModal from '../components/ReleaseModal.jsx'
import { RELEASE_SORT_OPTIONS } from '../sortOptions.js'
import { decideRelease } from '../api.js'

export function FundReleasesPage() {
  const { role } = useSession()
  const config = configFor(role)
  const [query, onQueryChange] = useListQuery()
  const queue = useRoleQueue(config?.queue, query)

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

      <ListView
        query={query}
        onQueryChange={onQueryChange}
        items={queue.data}
        isLoading={queue.isLoading}
        error={queue.error}
        emptyMessage="Nothing is waiting for release."
        sortOptions={RELEASE_SORT_OPTIONS}
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

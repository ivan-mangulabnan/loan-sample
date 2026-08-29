import { useCallback } from 'react'
import Button from '../../../components/Button.jsx'
import { useListQuery } from '../../../hooks/useListQuery.js'
import { useWriteAction } from '../../../hooks/useWriteAction.js'
import { ListView, QueueTable, configFor, useRoleQueue } from '../../dashboard/index.js'
import { useSession } from '../../auth/index.js'
import { useLedger } from '../../ledger/index.js'
import CapitalNotice from '../components/CapitalNotice.jsx'
import ReleaseModal from '../components/ReleaseModal.jsx'
import { RELEASE_SORT_OPTIONS } from '../sortOptions.js'
import { decideRelease } from '../api.js'

export function FundReleasesPage() {
  const { role } = useSession()
  const config = configFor(role)
  const [query, onQueryChange] = useListQuery()
  const queue = useRoleQueue(config?.queue, query)

  const ledger = useLedger()

  const send = useCallback(
    (release, { decision, remarks }) =>
      decideRelease({ loanApprovalId: release.loanApprovalId, decision, remarks }),
    [],
  )

  // A release draws the ledger down, so the balance this page gates on is stale the
  // moment one succeeds — reload it alongside the queue.
  const refresh = useCallback(() => {
    queue.reload()
    ledger.reload()
  }, [queue, ledger])

  const release = useWriteAction(send, refresh)

  // Undefined while loading, and 409 means the tenant has no ledger at all — in
  // neither case do we know of a shortfall, so nothing is blocked and the queue
  // behaves exactly as it did before.
  const balance = ledger.data?.currentBalance
  const knowsBalance = typeof balance === 'number'

  const rows = queue.data ?? []
  const underfunded = knowsBalance
    ? rows.filter((row) => row.principalAmount > balance)
    : []

  // The cheapest deposit that unblocks anything: enough to cover the smallest
  // approved loan the ledger currently cannot fund.
  const shortfall =
    underfunded.length > 0
      ? Math.min(...underfunded.map((row) => row.principalAmount)) - balance
      : 0

  // Deliberately not disabling the row's Decide button: the modal it opens also
  // *rejects*, which moves no money and must stay reachable when the ledger is
  // short. The block belongs on "Release funds" alone, inside the modal.
  const releaseBlocked =
    knowsBalance && release.target
      ? release.target.principalAmount > balance
      : false

  return (
    <>
      <header className="page-head">
        <div>
          <h1 className="heading">Fund release</h1>
          <p className="muted">Approved loans awaiting disbursement</p>
        </div>
        <Button size="sm" onClick={refresh}>
          Refresh
        </Button>
      </header>

      <CapitalNotice
        balance={balance}
        shortfall={shortfall}
        blocked={underfunded.length}
      />

      <ListView
        skeletonColumns={7}
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
        balance={balance}
        releaseBlocked={releaseBlocked}
        onSubmit={release.run}
        onClose={release.close}
        isSubmitting={release.isSubmitting}
        error={release.error}
      />
    </>
  )
}

export default FundReleasesPage

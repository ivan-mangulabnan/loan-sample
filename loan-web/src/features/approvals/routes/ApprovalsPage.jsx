import { useCallback } from 'react'
import Button from '../../../components/Button.jsx'
import { useToast } from '../../../components/useToast.js'
import { useListQuery } from '../../../hooks/useListQuery.js'
import { useWriteAction } from '../../../hooks/useWriteAction.js'
import { ListView, QueueTable, configFor, useRoleQueue } from '../../dashboard/index.js'
import {
  DECISIONS,
  DECISION_OUTCOMES,
  DecisionModal,
  QUEUE_SORT_OPTIONS,
} from '../../loan-applications/index.js'
import { useSession } from '../../auth/index.js'
import { submitApproval } from '../api.js'

const APPROVAL_DECISIONS = [DECISIONS.Approve, DECISIONS.Reject]

// Approving sends the application on to release and rejecting is terminal; both
// are held briefly behind an undo. See ReviewPage for the same arrangement.
const DEFERRED = {
  deferMessage: (application, { decision }) =>
    `Application #${application.loanApplicationId} ${DECISION_OUTCOMES[decision]}.`,
  keyOf: (application) => application.loanApplicationId,
}

export function ApprovalsPage() {
  const { role } = useSession()
  const config = configFor(role)
  const [query, onQueryChange] = useListQuery()
  const queue = useRoleQueue(config?.queue, query)

  const send = useCallback(
    (application, { decision, remarks }) =>
      submitApproval({
        loanApplicationId: application.loanApplicationId,
        decision,
        remarks,
      }),
    [],
  )

  const approval = useWriteAction(send, queue.reload, DEFERRED)

  const { pendingKeys } = useToast()

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
        skeletonColumns={7}
        query={query}
        onQueryChange={onQueryChange}
        items={queue.data}
        isLoading={queue.isLoading}
        error={queue.error}
        emptyMessage="No applications are waiting for approval."
        sortOptions={QUEUE_SORT_OPTIONS}
        searchPlaceholder="Search by reference or borrower name"
        searchLabel="Search the approval queue"
      >
        {(rows) => (
          <QueueTable
            shape="application"
            rows={rows.filter((row) => !pendingKeys.has(row.loanApplicationId))}
            actionLabel="Decide"
            onAction={approval.open}
          />
        )}
      </ListView>

      <DecisionModal
        key={approval.target?.loanApplicationId}
        application={approval.target}
        decisions={APPROVAL_DECISIONS}
        title="Approval"
        onSubmit={approval.run}
        onClose={approval.close}
        isSubmitting={approval.isSubmitting}
        error={approval.error}
      />
    </>
  )
}

export default ApprovalsPage

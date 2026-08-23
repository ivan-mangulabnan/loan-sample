import { useCallback } from 'react'
import Button from '../../../components/Button.jsx'
import { useListQuery } from '../../../hooks/useListQuery.js'
import { useWriteAction } from '../../../hooks/useWriteAction.js'
import { ListView, QueueTable, configFor, useRoleQueue } from '../../dashboard/index.js'
import { DECISIONS, DecisionModal, QUEUE_SORT_OPTIONS } from '../../loan-applications/index.js'
import { useSession } from '../../auth/index.js'
import { submitApproval } from '../api.js'

/**
 * Approval decisions: applications at PENDING_APPROVAL, already reviewed. Its
 * own component rather than a shared queue page — approving is not reviewing,
 * and the decision action lives here.
 *
 * No status filter: the endpoint is pinned to one stage server-side.
 */

// Two, not three. LoanApprovalService has no case for Return and throws on it: sending
// an application back for changes is the reviewer's move, and by this desk it has
// already passed one.
const APPROVAL_DECISIONS = [DECISIONS.Approve, DECISIONS.Reject]

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

  const approval = useWriteAction(send, queue.reload)

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
        // Oldest first: this is a queue, and the application that has waited
        // longest is the one to work next (rule 20b).
        sortOptions={QUEUE_SORT_OPTIONS}
        searchPlaceholder="Search by reference or borrower name"
        searchLabel="Search the approval queue"
      >
        {(rows) => (
          <QueueTable
            shape="application"
            rows={rows}
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

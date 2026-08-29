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
import { submitReview } from '../api.js'

const REVIEW_DECISIONS = [DECISIONS.Approve, DECISIONS.Return, DECISIONS.Reject]

const DEFERRED = {
  deferMessage: (application, { decision }) =>
    `Application #${application.loanApplicationId} ${DECISION_OUTCOMES[decision]}.`,
  keyOf: (application) => application.loanApplicationId,
}

export function ReviewPage() {
  const { role } = useSession()
  const config = configFor(role)
  const [query, onQueryChange] = useListQuery()
  const queue = useRoleQueue(config?.queue, query)

  const send = useCallback(
    (application, { decision, remarks }) =>
      submitReview({
        loanApplicationId: application.loanApplicationId,
        decision,
        remarks,
      }),
    [],
  )

  const review = useWriteAction(send, queue.reload, DEFERRED)

  const { pendingKeys } = useToast()

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
        skeletonColumns={7}
        query={query}
        onQueryChange={onQueryChange}
        items={queue.data}
        isLoading={queue.isLoading}
        error={queue.error}
        emptyMessage="No applications are waiting for review."
        sortOptions={QUEUE_SORT_OPTIONS}
        searchPlaceholder="Search by reference or borrower name"
        searchLabel="Search the review queue"
      >
        {(rows) => (
          <QueueTable
            shape="application"
            rows={rows.filter((row) => !pendingKeys.has(row.loanApplicationId))}
            actionLabel="Review"
            onAction={review.open}
          />
        )}
      </ListView>

      <DecisionModal
        
        application={review.target}
        decisions={REVIEW_DECISIONS}
        title="Review"
        onSubmit={review.run}
        onClose={review.close}
        isSubmitting={review.isSubmitting}
        error={review.error}
      />
    </>
  )
}

export default ReviewPage

import { useCallback } from 'react'
import Button from '../../../components/Button.jsx'
import { useListQuery } from '../../../hooks/useListQuery.js'
import { useWriteAction } from '../../../hooks/useWriteAction.js'
import { ListView, QueueTable, configFor, useRoleQueue } from '../../dashboard/index.js'
import { DECISIONS, DecisionModal, QUEUE_SORT_OPTIONS } from '../../loan-applications/index.js'
import { useSession } from '../../auth/index.js'
import { submitReview } from '../api.js'

/**
 * First-pass review: applications at PENDING_REVIEW. Its own component rather
 * than a shared queue page, so the URL means this area and the review action has
 * somewhere to land.
 *
 * No status filter: the endpoint is pinned to one stage server-side, so a dropdown
 * here could only ever offer the stage the reader is already looking at.
 */

// The reviewer's full vocabulary. Return sends the application back to the borrower to
// change the plan; the approver, one desk on, has no such option.
const REVIEW_DECISIONS = [DECISIONS.Approve, DECISIONS.Return, DECISIONS.Reject]

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

  const review = useWriteAction(send, queue.reload)

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
        items={queue.data}
        isLoading={queue.isLoading}
        error={queue.error}
        emptyMessage="No applications are waiting for review."
        // Oldest first: this is a queue, and the application that has waited
        // longest is the one to work next (rule 20b).
        sortOptions={QUEUE_SORT_OPTIONS}
        searchPlaceholder="Search by reference or borrower name"
        searchLabel="Search the review queue"
      >
        {(rows) => (
          <QueueTable
            shape="application"
            rows={rows}
            actionLabel="Review"
            onAction={review.open}
          />
        )}
      </ListView>

      {/* Keyed on the row so the remarks box starts empty for each application — the
          modal unmounts between rows, and a key change is what guarantees it. */}
      <DecisionModal
        key={review.target?.loanApplicationId}
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

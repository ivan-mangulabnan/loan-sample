/**
 * Latest/oldest for the release queue.
 *
 * Its own file rather than reusing loan-applications' QUEUE_SORT_OPTIONS, because this
 * queue's rows are a different shape: a release row is an *approval*, keyed
 * `loanApprovalId`/`approvalDate`, and carries no `dateRequested` at all. Handing it the
 * application comparator would subtract two `undefined`s, yield NaN, and leave the rows
 * in whatever order sort happened to land them — a silently scrambled FIFO queue, which
 * is the exact failure this whole split exists to prevent (rule 20b).
 *
 * Position 0 is the default and must stay `oldest`: FundReleaseService orders
 * `OrderBy(ApprovalDate)` because the approval waiting longest is the one to release
 * next.
 */

/**
 * LoanApprovalId breaks the tie, quoting FundReleaseService's own reason: ApprovalDate
 * is a UtcNow stamp, so two decisions recorded in the same tick would otherwise swap
 * places between requests, and the client pages this list by position.
 */
const byApproval = (a, b) =>
  new Date(a.approvalDate) - new Date(b.approvalDate) || a.loanApprovalId - b.loanApprovalId

export const RELEASE_SORT_OPTIONS = [
  { value: 'oldest', label: 'Oldest first', compare: byApproval },
  { value: 'latest', label: 'Latest first', compare: (a, b) => byApproval(b, a) },
]

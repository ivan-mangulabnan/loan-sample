/**
 * Latest/oldest for the application lists, as `{ value, label, compare }` triples
 * ListView can sort by without learning what an application is (rule 4).
 *
 * Two arrays over one pair of comparators, and **the array order is the default**:
 * position 0 is what the list opens on. That is the whole point of splitting them.
 *
 * Work queues are FIFO — ReviewApplicationService and LoanApprovalService both order
 * `OrderBy(DateRequested)`, because the application that has waited longest is the one
 * to work next. Record views read newest-first — LoanApplicationService orders
 * `OrderByDescending(DateRequested)`, because the row someone wants is the one that
 * just moved. Handing every list one global "Latest first" default would flip the
 * queues out of FIFO and sink the longest-waiting application behind every new
 * arrival: a behaviour change wearing a filter's clothes (rule 20b).
 */

/**
 * LoanApplicationId breaks the tie for the same reason every backend ordering does:
 * DateRequested is a UtcNow stamp, so applications submitted in one tick would
 * otherwise swap places between renders — and ListView pages by position, so two rows
 * trading places can move one onto another page.
 */
const byRequested = (a, b) =>
  new Date(a.dateRequested) - new Date(b.dateRequested) ||
  a.loanApplicationId - b.loanApplicationId

export const OLDEST_FIRST = {
  value: 'oldest',
  label: 'Oldest first',
  compare: byRequested,
}

export const LATEST_FIRST = {
  value: 'latest',
  label: 'Latest first',
  compare: (a, b) => byRequested(b, a),
}

/** Review, approvals, releases. Opens oldest-first: do not reorder this array. */
export const QUEUE_SORT_OPTIONS = [OLDEST_FIRST, LATEST_FIRST]

/** My applications, all applications. Opens latest-first. */
export const RECORD_SORT_OPTIONS = [LATEST_FIRST, OLDEST_FIRST]

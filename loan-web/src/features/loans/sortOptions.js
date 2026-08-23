/**
 * Latest/oldest for the borrower's two lists. Same shape and same rule as the
 * application options next door (`loan-applications/sortOptions.js`): position 0 of
 * each array is the default, and it must be the order the endpoint already returns.
 *
 * Both of these are record views, not work queues, so both open **latest first** —
 * LoanService orders `OrderByDescending(StartDate)` and PaymentService
 * `OrderByDescending(PaymentDate)`. Neither list is a queue anyone works through, so
 * there is no FIFO reading to preserve here (rule 20b).
 */

/**
 * LoanId breaks the tie for the reason LoanService writes down: StartDate is the
 * release stamp, so loans released in one batch share it and would otherwise swap
 * places between renders.
 */
const byStart = (a, b) =>
  new Date(a.startDate) - new Date(b.startDate) || a.loanId - b.loanId

/**
 * PaymentId breaks the tie, and here it is not theoretical: twelve payments posted
 * through the API in one pass landed inside two clock seconds, so date alone leaves
 * most of the list ambiguous.
 */
const byPaid = (a, b) =>
  new Date(a.paymentDate) - new Date(b.paymentDate) || a.paymentId - b.paymentId

export const LOAN_SORT_OPTIONS = [
  { value: 'latest', label: 'Latest first', compare: (a, b) => byStart(b, a) },
  { value: 'oldest', label: 'Oldest first', compare: byStart },
]

export const PAYMENT_SORT_OPTIONS = [
  { value: 'latest', label: 'Latest first', compare: (a, b) => byPaid(b, a) },
  { value: 'oldest', label: 'Oldest first', compare: byPaid },
]


/** An untouched filter: every field empty, which matches everything. */
export const NO_PAYMENT_FILTERS = { from: '', to: '', min: '', max: '' }

/**
 * Does one payment survive the date and amount ranges?
 *
 * Every bound is optional and each is applied only when it parses, so a half-typed
 * "1" in the min box narrows the list rather than blanking it, and a cleared field
 * stops filtering immediately.
 *
 * The date comparison is by **calendar day, not instant**: `paymentDate` carries a
 * time, and a payment made at 12:27 on the 22nd is plainly "on the 22nd" — comparing
 * it against midnight would drop it from a range whose `to` is that same day. Both
 * sides are reduced to a YYYY-MM-DD string, which is what the date input already
 * gives us and which sorts correctly as text.
 */
export function matchesPaymentFilters(payment, filters) {
  const { from, to, min, max } = filters

  if (from || to) {
    const d = new Date(payment.paymentDate)
    // Local calendar day, not toISOString(): that converts to UTC first, so an evening
    // payment east of Greenwich would report the following day and fall out of range.
    const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate(),
    ).padStart(2, '0')}`

    if (from && day < from) return false
    if (to && day > to) return false
  }

  const low = Number.parseFloat(min)
  if (Number.isFinite(low) && payment.amount < low) return false

  const high = Number.parseFloat(max)
  if (Number.isFinite(high) && payment.amount > high) return false

  return true
}

/** True when any bound is set — the caller needs this to say "no matches" honestly. */
export function hasPaymentFilters(filters) {
  return Object.values(filters).some((v) => v !== '')
}

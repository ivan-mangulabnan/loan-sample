/**
 * How a loan is doing, in the two forms the UI keeps asking for. Promoted out of
 * LoanTable when the detail view needed the same answers (rule 3).
 *
 * Both read only borrower-safe fields. `grade`, `daysBehind` and `isGoodPayer` are
 * nulled by the API for a Loaner (rule 21), so nothing here may reach for them.
 */

import { LOAN_STATUS_OPTIONS } from './statusOptions.js'

/** Repaid share of the total, 0-100. Guards a zero total so a malformed row is 0%, not NaN%. */
export function repaidPercent(loan) {
  const total = loan.totalRepaymentAmount
  if (!total || total <= 0) return 0

  return ((total - loan.balance) / total) * 100
}

/**
 * Where the schedule says the borrower should be by today, as a percentage of the total.
 * Drawn as a marker against `repaidPercent` — the gap between the two is the whole point
 * of showing a progress bar rather than a number.
 */
export function expectedPercent(loan) {
  const total = loan.totalRepaymentAmount
  const expected = loan.standing?.expectedPaidToDate

  if (!total || total <= 0 || typeof expected !== 'number') return null

  return Math.min(100, Math.max(0, (expected / total) * 100))
}

/**
 * daysRemaining is a plain int that keeps counting down past the due date, so a late
 * loan reports a negative. "-12 days left" reads as a bug; say what it means.
 */
export function dueNote(loan) {
  const days = loan.standing?.daysRemaining
  if (typeof days !== 'number') return null

  if (days < 0) return `${Math.abs(days)} days overdue`

  return `${days} days left`
}

/**
 * Loan lifecycle codes the API refuses a payment for — PaymentService throws on these
 * two. OVERDUE is deliberately absent: a late loan is the one that most needs paying,
 * and gating the button on lateness would lock out the borrower trying to catch up.
 */
const TERMINAL_CODES = ['PAID', 'DEFAULTED']

/**
 * Resolved through LOAN_STATUS_OPTIONS rather than written out, because the two
 * vocabularies do not line up: PAID's label is **"Fully Paid"**. Matching 'paid'
 * against the label silently never fires, and a settled loan would keep offering a
 * Pay button that the API then rejects. That file already owns the mapping (rule 20a).
 */
const TERMINAL_LABELS = LOAN_STATUS_OPTIONS.filter((option) =>
  TERMINAL_CODES.includes(option.code),
).map((option) => option.label.toLowerCase())

/** True when the API will refuse a payment because the loan is closed. */
export function isSettled(loan) {
  return TERMINAL_LABELS.includes((loan?.status ?? '').trim().toLowerCase())
}

import { apiClient } from '../../lib/apiClient.js'
import { withQuery } from '../../lib/query.js'

/**
 * Returns a bare array: the whole filtered list, capped server-side. `params` carries
 * `{ search, status }`, where `status` is a loan lifecycle CODE — its own vocabulary,
 * never an application status (rule 20).
 */
export function fetchMyLoans(params, options) {
  return apiClient.get(withQuery('/Loan/me', params), options)
}

export function fetchLoan(id, options) {
  return apiClient.get(`/Loan/${id}`, options)
}

/**
 * The payments made against one loan, oldest first. A sub-resource of the loan rather
 * than a filter on /Payment, so it inherits the loan's own visibility check — a borrower
 * reading someone else's loan id gets a 404, not an empty list.
 */
export function fetchLoanPayments(id, options) {
  return apiClient.get(`/Loan/${id}/payments`, options)
}

/**
 * Posts a repayment — POST /api/Payment, Loaner only.
 *
 * `amount` must be a number, not the field's string: the API binds a decimal. Two rules
 * answer 409 here — paying more than the balance, and paying a loan that is already
 * closed. Settling the balance exactly is what closes the loan, so a success can change
 * the loan's status as well as its balance; re-read it rather than patching state.
 */
export function postPayment({ loanId, amount }) {
  return apiClient.post('/Payment', { loanId, amount })
}

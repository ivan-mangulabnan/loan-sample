import { apiClient } from '../../lib/apiClient.js'
import { withQuery } from '../../lib/query.js'

export function fetchMyLoans(params, options) {
  return apiClient.get(withQuery('/Loan/me', params), options)
}

export function fetchLoan(id, options) {
  return apiClient.get(`/Loan/${id}`, options)
}

export function fetchLoanPayments(id, options) {
  return apiClient.get(`/Loan/${id}/payments`, options)
}

export function postPayment({ loanId, amount }) {
  return apiClient.post('/Payment', { loanId, amount })
}

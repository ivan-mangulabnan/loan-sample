import { apiClient } from '../../lib/apiClient.js'
import { withQuery } from '../../lib/query.js'

/**
 * Returns a `PagedResponse` envelope, not a bare array. `params` carries
 * `{ page, search, status }`, where `status` is a loan lifecycle CODE — its own
 * vocabulary, never an application status (rule 20).
 */
export function fetchMyLoans(params, options) {
  return apiClient.get(withQuery('/Loan/me', params), options)
}

export function fetchLoan(id, options) {
  return apiClient.get(`/Loan/${id}`, options)
}

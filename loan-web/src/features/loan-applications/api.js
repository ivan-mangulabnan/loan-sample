import { apiClient } from '../../lib/apiClient.js'
import { withQuery } from '../../lib/query.js'

/**
 * Both list endpoints return a `PagedResponse` envelope — `{ items, page, pageSize,
 * totalCount, totalPages, hasNext, hasPrevious }` — not a bare array. `params` carries
 * `{ page, search, status }`; `status` is the backend's status CODE, and withQuery drops
 * whatever is unset so an untouched filter sends no parameter at all.
 */
export function fetchMyApplications(params, options) {
  return apiClient.get(withQuery('/LoanApplication/me', params), options)
}

/** Staff-only: every application in the tenant, at any status. */
export function fetchAllApplications(params, options) {
  return apiClient.get(withQuery('/LoanApplication', params), options)
}

export function fetchApplication(id, options) {
  return apiClient.get(`/LoanApplication/${id}`, options)
}

export function createApplication(payload) {
  return apiClient.post('/LoanApplication', payload)
}

export function cancelApplication(id) {
  return apiClient.post(`/LoanApplication/${id}/cancel`)
}

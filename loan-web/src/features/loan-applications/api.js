import { apiClient } from '../../lib/apiClient.js'
import { withQuery } from '../../lib/query.js'

/**
 * Both list endpoints return a bare array of rows — the whole filtered list, capped
 * server-side. `params` carries `{ search, status }`; `status` is the backend's status
 * CODE, and withQuery drops whatever is unset so an untouched filter sends no parameter
 * at all. There is no page parameter: paging happens in the browser.
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

/**
 * The plans a borrower can apply under. Global reference data — PaymentPlans carries no
 * TenantId — so this is the same list for every reader and needs no params.
 */
export function fetchPaymentPlans(options) {
  return apiClient.get('/PaymentPlan', options)
}

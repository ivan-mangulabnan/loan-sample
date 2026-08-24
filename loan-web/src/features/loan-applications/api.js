import { apiClient } from '../../lib/apiClient.js'
import { withQuery } from '../../lib/query.js'

export function fetchMyApplications(params, options) {
  return apiClient.get(withQuery('/LoanApplication/me', params), options)
}

export function fetchAllApplications(params, options) {
  return apiClient.get(withQuery('/LoanApplication', params), options)
}

export function fetchApplication(id, options) {
  return apiClient.get(`/LoanApplication/${id}`, options)
}

export function createApplication(payload) {
  return apiClient.post('/LoanApplication', payload)
}

export function resubmitApplication(id, { paymentPlanId, amount }) {
  return apiClient.put(`/LoanApplication/${id}/resubmit`, { paymentPlanId, amount })
}

export function cancelApplication(id) {
  return apiClient.post(`/LoanApplication/${id}/cancel`)
}

export function fetchPaymentPlans(options) {
  return apiClient.get('/PaymentPlan', options)
}

import { apiClient } from '../../lib/apiClient.js'

export function fetchMyApplications(options) {
  return apiClient.get('/LoanApplication/me', options)
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

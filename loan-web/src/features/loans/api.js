import { apiClient } from '../../lib/apiClient.js'

export function fetchMyLoans(options) {
  return apiClient.get('/Loan/me', options)
}

export function fetchLoan(id, options) {
  return apiClient.get(`/Loan/${id}`, options)
}

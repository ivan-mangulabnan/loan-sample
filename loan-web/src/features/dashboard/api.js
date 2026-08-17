import { apiClient } from '../../lib/apiClient.js'

export function fetchQueue(path, options) {
  return apiClient.get(path, options)
}

export function fetchLedgerBalance(options) {
  return apiClient.get('/Ledger/balance', options)
}

/**
 * Overview aggregates. `path` comes from roleConfig — /Stats/dashboard for staff,
 * /Stats/me for a borrower — so the client never picks a URL by inspecting the role.
 */
export function fetchDashboardStats(path, days, options) {
  return apiClient.get(`${path}?days=${days}`, options)
}

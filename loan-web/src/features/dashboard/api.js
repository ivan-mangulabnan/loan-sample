import { apiClient } from '../../lib/apiClient.js'
import { withQuery } from '../../lib/query.js'

/**
 * `path` comes from roleConfig and is unchanged; `params` carries `{ page, search,
 * status }`. All three queues return a `PagedResponse` envelope now, so callers read
 * `data.items`, not `data`.
 */
export function fetchQueue(path, params, options) {
  return apiClient.get(withQuery(path, params), options)
}

export function fetchLedgerBalance(options) {
  return apiClient.get('/Ledger/balance', options)
}

/**
 * Overview aggregates. `path` comes from roleConfig — /Stats/dashboard for staff,
 * /Stats/me for a borrower — so the client never picks a URL by inspecting the role.
 */
export function fetchDashboardStats(path, days, options) {
  return apiClient.get(withQuery(path, { days }), options)
}

import { apiClient } from '../../lib/apiClient.js'
import { withQuery } from '../../lib/query.js'

/**
 * `path` comes from roleConfig and is unchanged; `params` carries `{ search, status }`.
 * All three queues return a bare array of rows — no page parameter, no envelope. How
 * many of them fit on screen is the browser's question, and it is answered in ListView.
 */
export function fetchQueue(path, params, options) {
  return apiClient.get(withQuery(path, params), options)
}

/**
 * Overview aggregates. `path` comes from roleConfig — /Stats/dashboard for staff,
 * /Stats/me for a borrower — so the client never picks a URL by inspecting the role.
 */
export function fetchDashboardStats(path, days, options) {
  return apiClient.get(withQuery(path, { days }), options)
}

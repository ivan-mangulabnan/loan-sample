import { apiClient } from '../../lib/apiClient.js'
import { withQuery } from '../../lib/query.js'

export function fetchQueue(path, params, options) {
  return apiClient.get(withQuery(path, params), options)
}

export function fetchDashboardStats(path, days, options) {
  return apiClient.get(withQuery(path, { days }), options)
}

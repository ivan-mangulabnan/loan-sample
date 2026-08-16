import { apiClient } from '../../lib/apiClient.js'

export function fetchQueue(path, options) {
  return apiClient.get(path, options)
}

export function fetchLedgerBalance(options) {
  return apiClient.get('/Ledger/balance', options)
}

import { apiClient } from '../../lib/apiClient.js'
import { withQuery } from '../../lib/query.js'

export function fetchLedgerBalance(options) {
  return apiClient.get('/Ledger/balance', options)
}

export function fetchLedgerTransactions(params, options) {
  return apiClient.get(withQuery('/Ledger/transactions', params), options)
}

export function postCapitalDeposit({ amount }) {
  return apiClient.post('/CapitalDeposit', { amount })
}

import { apiClient } from '../../lib/apiClient.js'
import { withQuery } from '../../lib/query.js'

/**
 * The tenant's operating ledger — Admin only, and the API enforces that (rule 18).
 *
 * Both reads answer 409 with a bare sentence when the tenant has no ledger. Only two
 * tenants are seeded one, so that is a reachable state rather than a theoretical one;
 * apiClient puts the sentence on ApiError.message and the page renders it.
 */
export function fetchLedgerBalance(options) {
  return apiClient.get('/Ledger/balance', options)
}

/**
 * The entries behind the balance. `params` carries `{ search, type }` — `type` is the
 * transaction type CODE, never the label. Built with withQuery because `search` is
 * user-typed and would otherwise corrupt the URL.
 *
 * Returns the filtered list whole, as every list endpoint here does; ListView pages it.
 */
export function fetchLedgerTransactions(params, options) {
  return apiClient.get(withQuery('/Ledger/transactions', params), options)
}

/**
 * Tops up the operating ledger. The amount must be positive — the API declares
 * [Range(0.01, ...)] — and the deposit posts immediately with no undo in the API.
 */
export function postCapitalDeposit({ amount }) {
  return apiClient.post('/CapitalDeposit', { amount })
}

import { useCallback } from 'react'
import { useApiResource } from '../../hooks/useApiResource.js'
import { fetchLedgerBalance, fetchLedgerTransactions } from './api.js'

/** The operating ledger's name and current balance. */
export function useLedger() {
  const fetcher = useCallback((options) => fetchLedgerBalance(options), [])

  return useApiResource(fetcher, [])
}

/**
 * The entries behind that balance.
 *
 * Reads `status`, not `type`: ListView owns one filter slot and calls it `status`
 * whatever the column happens to mean, so the rename to the API's `type` happens here
 * rather than by teaching ListView a second vocabulary.
 *
 * `page` is deliberately not a dependency — it is decided in the browser against the
 * height of the screen and never reaches the server, so depending on it would refetch
 * identical rows on every Next.
 */
export function useLedgerTransactions({ search = '', status = '' } = {}) {
  const type = status
  const fetcher = useCallback(
    (options) => fetchLedgerTransactions({ search, type }, options),
    [search, type],
  )

  return useApiResource(fetcher, [search, type])
}

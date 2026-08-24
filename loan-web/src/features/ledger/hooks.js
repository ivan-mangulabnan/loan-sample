import { useCallback } from 'react'
import { useApiResource } from '../../hooks/useApiResource.js'
import { fetchLedgerBalance, fetchLedgerTransactions } from './api.js'

export function useLedger() {
  const fetcher = useCallback((options) => fetchLedgerBalance(options), [])

  return useApiResource(fetcher, [])
}

export function useLedgerTransactions({ search = '', status = '' } = {}) {
  const type = status
  const fetcher = useCallback(
    (options) => fetchLedgerTransactions({ search, type }, options),
    [search, type],
  )

  return useApiResource(fetcher, [search, type])
}

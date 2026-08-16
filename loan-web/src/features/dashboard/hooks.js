import { useCallback } from 'react'
import { useApiResource } from '../../hooks/useApiResource.js'
import { fetchLedgerBalance, fetchQueue } from './api.js'

/** Loads whichever queue the signed-in role owns. */
export function useRoleQueue(queue) {
  const path = queue?.path ?? null

  const fetcher = useCallback(
    (options) => (path ? fetchQueue(path, options) : Promise.resolve([])),
    [path],
  )

  return useApiResource(fetcher, [path])
}

/** Admin-only: the tenant's capital ledger balance. */
export function useLedgerBalance(enabled) {
  const fetcher = useCallback(
    (options) => (enabled ? fetchLedgerBalance(options) : Promise.resolve(null)),
    [enabled],
  )

  return useApiResource(fetcher, [enabled])
}

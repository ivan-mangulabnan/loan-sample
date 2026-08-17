import { useCallback } from 'react'
import { useApiResource } from '../../hooks/useApiResource.js'
import { fetchDashboardStats, fetchLedgerBalance, fetchQueue } from './api.js'

/** Loads whichever queue the signed-in role owns. */
export function useRoleQueue(queue) {
  const path = queue?.path ?? null

  const fetcher = useCallback(
    (options) => (path ? fetchQueue(path, options) : Promise.resolve([])),
    [path],
  )

  return useApiResource(fetcher, [path])
}

/**
 * The staff overview aggregates. `stats` comes from roleConfig; a role without a stats
 * block (the Loaner) resolves to null without a request, so a borrower never touches a
 * staff endpoint — same shape as useRoleQueue.
 */
export function useDashboardStats(stats) {
  const path = stats?.path ?? null
  const days = stats?.days ?? 7

  const fetcher = useCallback(
    (options) => (path ? fetchDashboardStats(path, days, options) : Promise.resolve(null)),
    [path, days],
  )

  return useApiResource(fetcher, [path, days])
}

/** Admin-only: the tenant's capital ledger balance. */
export function useLedgerBalance(enabled) {
  const fetcher = useCallback(
    (options) => (enabled ? fetchLedgerBalance(options) : Promise.resolve(null)),
    [enabled],
  )

  return useApiResource(fetcher, [enabled])
}

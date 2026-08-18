import { useCallback } from 'react'
import { useApiResource } from '../../hooks/useApiResource.js'
import { fetchDashboardStats, fetchLedgerBalance, fetchQueue } from './api.js'

/**
 * Loads whichever queue the signed-in role owns, paged.
 *
 * `data` is a `PagedResponse` envelope now, so callers read `data.items` for the rows
 * and `data.totalCount` for "how many are waiting" — the two are no longer the same
 * number once a queue runs past one page.
 *
 * A role with no `queue` block (the Loaner) resolves to null without a request, so
 * nothing here fires a staff endpoint a borrower cannot call.
 */
export function useRoleQueue(queue, { page = 1, pageSize, search = '', status = '' } = {}) {
  const path = queue?.path ?? null

  const fetcher = useCallback(
    (options) =>
      path
        ? fetchQueue(path, { page, pageSize, search, status }, options)
        : Promise.resolve(null),
    [path, page, pageSize, search, status],
  )

  return useApiResource(fetcher, [path, page, pageSize, search, status])
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

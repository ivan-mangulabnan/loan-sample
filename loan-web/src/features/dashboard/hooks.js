import { useCallback } from 'react'
import { useApiResource } from '../../hooks/useApiResource.js'
import { fetchDashboardStats, fetchQueue } from './api.js'

/**
 * Loads whichever queue the signed-in role owns — the whole filtered queue, as an
 * array. `data.length` is therefore both the row count and the number waiting; there
 * is no envelope and no separate total to disagree with it.
 *
 * A role with no `queue` block (the Loaner) resolves to null without a request, so
 * nothing here fires a staff endpoint a borrower cannot call.
 */
export function useRoleQueue(queue, { search = '', status = '' } = {}) {
  const path = queue?.path ?? null

  const fetcher = useCallback(
    (options) => (path ? fetchQueue(path, { search, status }, options) : Promise.resolve(null)),
    [path, search, status],
  )

  return useApiResource(fetcher, [path, search, status])
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


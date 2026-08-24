import { useCallback } from 'react'
import { useApiResource } from '../../hooks/useApiResource.js'
import { fetchDashboardStats, fetchQueue } from './api.js'

export function useRoleQueue(queue, { search = '', status = '' } = {}) {
  const path = queue?.path ?? null

  const fetcher = useCallback(
    (options) => (path ? fetchQueue(path, { search, status }, options) : Promise.resolve(null)),
    [path, search, status],
  )

  return useApiResource(fetcher, [path, search, status])
}

export function useDashboardStats(stats) {
  const path = stats?.path ?? null
  const days = stats?.days ?? 7

  const fetcher = useCallback(
    (options) => (path ? fetchDashboardStats(path, days, options) : Promise.resolve(null)),
    [path, days],
  )

  return useApiResource(fetcher, [path, days])
}


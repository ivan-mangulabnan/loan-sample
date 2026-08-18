import { useCallback } from 'react'
import { useApiResource } from '../../hooks/useApiResource.js'
import {
  fetchAllApplications,
  fetchApplication,
  fetchMyApplications,
} from './api.js'

/**
 * `params` is `{ page, search, status }`. The deps list is spelled out rather than
 * passing the object: a fresh object literal on every render would refetch forever,
 * which is why `useApplication(id)` threads the primitive too.
 *
 * `useApiResource` already aborts the in-flight request when a dep changes, so a slow
 * search cannot land after the term that replaced it.
 */
export function useMyApplications({ page = 1, search = '', status = '' } = {}) {
  return useApiResource(
    useCallback(
      (options) => fetchMyApplications({ page, search, status }, options),
      [page, search, status],
    ),
    [page, search, status],
  )
}

/** Staff-only — the endpoint 403s for a Loaner. */
export function useAllApplications({ page = 1, search = '', status = '' } = {}) {
  return useApiResource(
    useCallback(
      (options) => fetchAllApplications({ page, search, status }, options),
      [page, search, status],
    ),
    [page, search, status],
  )
}

export function useApplication(id) {
  return useApiResource(
    useCallback((options) => fetchApplication(id, options), [id]),
    [id],
  )
}

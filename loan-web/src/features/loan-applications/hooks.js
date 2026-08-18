import { useCallback } from 'react'
import { useApiResource } from '../../hooks/useApiResource.js'
import {
  fetchAllApplications,
  fetchApplication,
  fetchPaymentPlans,
  fetchMyApplications,
} from './api.js'

/**
 * `params` is `{ search, status }` — the two filters the server applies. `page` is
 * deliberately absent: turning a page re-slices rows already in memory and must not
 * reach this layer at all, or every page turn would be a round trip.
 *
 * The deps list is spelled out rather than passing the object: a fresh object literal
 * on every render would refetch forever, which is why `useApplication(id)` threads the
 * primitive too.
 *
 * `useApiResource` already aborts the in-flight request when a dep changes, so a slow
 * search cannot land after the term that replaced it.
 */
export function useMyApplications({ search = '', status = '' } = {}) {
  return useApiResource(
    useCallback((options) => fetchMyApplications({ search, status }, options), [search, status]),
    [search, status],
  )
}

/** Staff-only — the endpoint 403s for a Loaner. */
export function useAllApplications({ search = '', status = '' } = {}) {
  return useApiResource(
    useCallback((options) => fetchAllApplications({ search, status }, options), [search, status]),
    [search, status],
  )
}

export function useApplication(id) {
  return useApiResource(
    useCallback((options) => fetchApplication(id, options), [id]),
    [id],
  )
}

/**
 * Plans for the apply form's picker. No deps: the list is reference data and does not
 * vary by reader, so it is fetched once per mount of whatever needs it.
 */
export function usePaymentPlans() {
  return useApiResource(useCallback((options) => fetchPaymentPlans(options), []), [])
}

import { useCallback } from 'react'
import { useApiResource } from '../../hooks/useApiResource.js'
import {
  fetchAllApplications,
  fetchApplication,
  fetchMyApplications,
} from './api.js'

export function useMyApplications() {
  return useApiResource(useCallback((options) => fetchMyApplications(options), []))
}

/** Staff-only — the endpoint 403s for a Loaner. */
export function useAllApplications() {
  return useApiResource(useCallback((options) => fetchAllApplications(options), []))
}

export function useApplication(id) {
  return useApiResource(
    useCallback((options) => fetchApplication(id, options), [id]),
    [id],
  )
}

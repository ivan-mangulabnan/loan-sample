import { useCallback } from 'react'
import { useApiResource } from '../../hooks/useApiResource.js'
import { fetchApplication, fetchMyApplications } from './api.js'

export function useMyApplications() {
  return useApiResource(useCallback((options) => fetchMyApplications(options), []))
}

export function useApplication(id) {
  return useApiResource(
    useCallback((options) => fetchApplication(id, options), [id]),
    [id],
  )
}

import { useCallback } from 'react'
import { useApiResource } from '../../hooks/useApiResource.js'
import {
  fetchAllApplications,
  fetchApplication,
  fetchPaymentPlans,
  fetchMyApplications,
} from './api.js'

export function useMyApplications({ search = '', status = '' } = {}) {
  return useApiResource(
    useCallback((options) => fetchMyApplications({ search, status }, options), [search, status]),
    [search, status],
  )
}

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

export function usePaymentPlans() {
  return useApiResource(useCallback((options) => fetchPaymentPlans(options), []), [])
}

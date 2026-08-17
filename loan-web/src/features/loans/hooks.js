import { useCallback } from 'react'
import { useApiResource } from '../../hooks/useApiResource.js'
import { fetchLoan, fetchMyLoans } from './api.js'

/**
 * The signed-in borrower's own loans. `/Loan/me` is Loaner-only, so staff must
 * pass enabled=false — resolving to [] rather than skipping the hook, matching
 * useRoleQueue. Firing it for staff would earn a 403 on every dashboard load.
 */
export function useMyLoans(enabled = true) {
  const fetcher = useCallback(
    (options) => (enabled ? fetchMyLoans(options) : Promise.resolve([])),
    [enabled],
  )

  return useApiResource(fetcher, [enabled])
}

export function useLoan(id) {
  return useApiResource(
    useCallback((options) => fetchLoan(id, options), [id]),
    [id],
  )
}

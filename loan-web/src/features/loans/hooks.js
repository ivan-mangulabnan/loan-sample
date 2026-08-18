import { useCallback } from 'react'
import { useApiResource } from '../../hooks/useApiResource.js'
import { fetchLoan, fetchMyLoans } from './api.js'

/**
 * The signed-in borrower's own loans, paged. `params` is `{ page, search, status }` and
 * the deps are spelled out as primitives — an object literal would be a new value every
 * render and refetch forever.
 *
 * The old `enabled` flag is gone with the borrower dashboard's loans table: `/Loan/me`
 * is Loaner-only, and the one caller left is `/loans`, which `RequireRole` already gates
 * to a Loaner. There is no longer a render path that could fire it for staff.
 */
export function useMyLoans({ page = 1, search = '', status = '' } = {}) {
  return useApiResource(
    useCallback(
      (options) => fetchMyLoans({ page, search, status }, options),
      [page, search, status],
    ),
    [page, search, status],
  )
}

export function useLoan(id) {
  return useApiResource(
    useCallback((options) => fetchLoan(id, options), [id]),
    [id],
  )
}

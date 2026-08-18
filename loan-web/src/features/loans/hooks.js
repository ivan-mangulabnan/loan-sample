import { useCallback } from 'react'
import { useApiResource } from '../../hooks/useApiResource.js'
import { fetchLoan, fetchLoanPayments, fetchMyLoans } from './api.js'

/**
 * The signed-in borrower's own loans, whole. `params` is `{ search, status }` and the
 * deps are spelled out as primitives — an object literal would be a new value every
 * render and refetch forever. No `page`: ListView slices what this returns.
 *
 * The old `enabled` flag is gone with the borrower dashboard's loans table: `/Loan/me`
 * is Loaner-only, and the one caller left is `/loans`, which `RequireRole` already gates
 * to a Loaner. There is no longer a render path that could fire it for staff.
 */
export function useMyLoans({ search = '', status = '' } = {}) {
  return useApiResource(
    useCallback((options) => fetchMyLoans({ search, status }, options), [search, status]),
    [search, status],
  )
}

export function useLoan(id) {
  return useApiResource(
    useCallback((options) => fetchLoan(id, options), [id]),
    [id],
  )
}

export function useLoanPayments(id) {
  return useApiResource(
    useCallback((options) => fetchLoanPayments(id, options), [id]),
    [id],
  )
}

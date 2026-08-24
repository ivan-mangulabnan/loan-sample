import { useCallback } from 'react'
import { useApiResource } from '../../hooks/useApiResource.js'
import { fetchLoan, fetchLoanPayments, fetchMyLoans } from './api.js'

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

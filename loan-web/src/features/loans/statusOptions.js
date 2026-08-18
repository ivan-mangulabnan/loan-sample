/**
 * The loan filter dropdown: status CODE to the label the API sends back.
 *
 * Its own list, not a merge with the application codes — the two are separate status
 * categories server-side and a loan can never be PENDING_REVIEW. Note PAID's label is
 * "Fully Paid": the same mismatch rule 20 warns about, now in the filter as well as the
 * badge.
 *
 * Codes mirror LoanApp/Constants/LoanLifecycleCodes.cs.
 */
export const LOAN_STATUS_OPTIONS = [
  { code: 'ACTIVE', label: 'Active' },
  { code: 'PAID', label: 'Fully Paid' },
  { code: 'OVERDUE', label: 'Overdue' },
  { code: 'DEFAULTED', label: 'Defaulted' },
]

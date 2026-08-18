import { apiClient } from '../../lib/apiClient.js'

/**
 * Disburses an approved loan — POST /api/FundRelease, Admin only.
 *
 * Keyed on the approval, not the application: the amount released is the principal the
 * approver settled on, which lives on LoanApproval.
 *
 * Two rules produce a 409 here — the application having moved off PENDING_RELEASE, and
 * the operating ledger not covering the principal. The second is the one worth reading
 * carefully; it means the tenant is out of capital, not that the request was malformed.
 */
export function releaseFunds({ loanApprovalId, remarks }) {
  return apiClient.post('/FundRelease', { loanApprovalId, remarks })
}

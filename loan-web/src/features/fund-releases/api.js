import { apiClient } from '../../lib/apiClient.js'

/**
 * The release desk's decision — POST /api/FundRelease, Admin only. Approve disburses,
 * Reject closes the application at REJECTED without moving a centavo.
 *
 * Keyed on the approval, not the application: the amount at stake is the principal the
 * approver settled on, which lives on LoanApproval.
 *
 * `decision` is never omitted. Unlike the other two desks the API declares it
 * `Decision?`, so a missing key here is a 400 rather than a silent Approve — but that is
 * a backstop, not a licence. Every caller sends one of the DECISIONS constants.
 *
 * Three rules produce a 409: the application having moved off PENDING_RELEASE, rejecting
 * without remarks, and — on approve only — the operating ledger not covering the
 * principal. The last is the one worth reading carefully; it means the tenant is out of
 * capital, not that the request was malformed.
 */
export function decideRelease({ loanApprovalId, decision, remarks }) {
  return apiClient.post('/FundRelease', { loanApprovalId, decision, remarks })
}

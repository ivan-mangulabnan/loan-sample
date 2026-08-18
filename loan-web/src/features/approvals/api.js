import { apiClient } from '../../lib/apiClient.js'

/**
 * Records an approval decision — POST /api/LoanApproval, Approver only.
 *
 * Approve and Reject only. The API's Decision enum also carries Return, but
 * LoanApprovalService has no case for it and throws — returning an application is the
 * reviewer's move, not the approver's.
 */
export function submitApproval({ loanApplicationId, decision, remarks }) {
  return apiClient.post('/LoanApproval', { loanApplicationId, decision, remarks })
}

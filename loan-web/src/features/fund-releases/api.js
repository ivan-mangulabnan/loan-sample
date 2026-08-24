import { apiClient } from '../../lib/apiClient.js'

export function decideRelease({ loanApprovalId, decision, remarks }) {
  return apiClient.post('/FundRelease', { loanApprovalId, decision, remarks })
}

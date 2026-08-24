import { apiClient } from '../../lib/apiClient.js'

export function submitApproval({ loanApplicationId, decision, remarks }) {
  return apiClient.post('/LoanApproval', { loanApplicationId, decision, remarks })
}

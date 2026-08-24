import { apiClient } from '../../lib/apiClient.js'

export function submitReview({ loanApplicationId, decision, remarks }) {
  return apiClient.post('/ReviewApplication', { loanApplicationId, decision, remarks })
}

import { apiClient } from '../../lib/apiClient.js'

/**
 * Records a first-pass review — POST /api/ReviewApplication, Reviewer only.
 *
 * `decision` is a DECISIONS value and is never optional: the API's enum defaults to
 * Approve when the key is missing (see loan-applications/decisions.js).
 *
 * The API answers 409 with a bare sentence when the application has already moved off
 * PENDING_REVIEW, which is the ordinary outcome of two reviewers opening the same row.
 */
export function submitReview({ loanApplicationId, decision, remarks }) {
  return apiClient.post('/ReviewApplication', { loanApplicationId, decision, remarks })
}

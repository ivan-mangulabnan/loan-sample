/**
 * What the borrower will owe if this application is approved.
 *
 * The same flat calculation the approver's endpoint performs — principal plus a flat
 * percentage, not an amortised schedule (LoanApprovalService.cs:60). Mirrored client-side
 * so a form can show a figure rather than leaving the reader to guess what "13%" costs.
 *
 * Lives here rather than inside a modal because two forms need it — applying and
 * resubmitting a returned application (rule 3). It is also the exact thing that must not
 * be written twice: two copies of a formula drift, and this one decides what someone owes.
 *
 * Indicative, and every caller must label it as such: the rate is read from the plan at
 * APPROVAL time, so a plan repriced in between would settle on a different number.
 */
export function repaymentPreview(amount, plan) {
  if (!plan || !Number.isFinite(amount) || amount <= 0) return null

  return Math.round(amount * (1 + plan.interestRate / 100) * 100) / 100
}

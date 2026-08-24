export function repaymentPreview(amount, plan) {
  if (!plan || !Number.isFinite(amount) || amount <= 0) return null

  return Math.round(amount * (1 + plan.interestRate / 100) * 100) / 100
}

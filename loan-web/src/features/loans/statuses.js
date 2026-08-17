/**
 * Loan lifecycle tones, keyed on Status.Label as the API sends it. These are a
 * separate status category from the application labels server-side, so they map
 * here rather than in loan-applications.
 *
 * Note the label is "Fully Paid", not "Paid" — the seeded value in
 * LoanApp/Data/LoanAppDbContext.cs. Matching "paid" alone silently falls back to
 * the muted tone and a settled loan renders grey instead of green.
 */
const TONES = {
  active: 'accent',
  'fully paid': 'success',
  overdue: 'warning',
  defaulted: 'danger',
}

export function loanStatusTone(label) {
  if (!label) return 'muted'
  return TONES[label.trim().toLowerCase()] ?? 'muted'
}

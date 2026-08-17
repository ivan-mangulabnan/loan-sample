/**
 * Maps the backend's status labels onto design tones. The API sends
 * Status.Label (human text), so we match on the label, lower-cased, and
 * fall back to a neutral tone for anything unmapped.
 * Codes come from LoanApp/Constants/LoanApplicationStatusCodes.cs.
 *
 * Application lifecycle only. A loan carries its own vocabulary in a separate
 * status category server-side — see features/loans/statuses.js.
 */
const TONES = {
  'pending review': 'warning',
  'pending approval': 'warning',
  'pending release': 'info',
  approved: 'accent',
  released: 'accent',
  'returned by reviewer': 'info',
  rejected: 'danger',
  cancelled: 'muted',
}

export function statusTone(label) {
  if (!label) return 'muted'
  return TONES[label.trim().toLowerCase()] ?? 'muted'
}

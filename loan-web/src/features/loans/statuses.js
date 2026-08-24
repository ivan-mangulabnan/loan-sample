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

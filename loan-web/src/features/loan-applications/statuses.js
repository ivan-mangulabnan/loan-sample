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

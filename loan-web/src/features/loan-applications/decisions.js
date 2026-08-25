export const DECISIONS = {
  Approve: 'Approve',
  Reject: 'Reject',
  Return: 'Return',
}

export const REQUIRES_REMARKS = [DECISIONS.Reject, DECISIONS.Return]

export const DECISION_LABELS = {
  [DECISIONS.Approve]: 'Approve',
  [DECISIONS.Reject]: 'Reject',
  [DECISIONS.Return]: 'Return for changes',
}

export const DECISION_OUTCOMES = {
  [DECISIONS.Approve]: 'approved',
  [DECISIONS.Reject]: 'rejected',
  [DECISIONS.Return]: 'returned for changes',
}

export const DECISION_GLYPHS = {
  [DECISIONS.Approve]: '✓',
  [DECISIONS.Reject]: '✕',
  [DECISIONS.Return]: '↺',
}

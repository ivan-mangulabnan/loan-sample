import { LOAN_STATUS_OPTIONS } from './statusOptions.js'

export function repaidPercent(loan) {
  const total = loan.totalRepaymentAmount
  if (!total || total <= 0) return 0

  return ((total - loan.balance) / total) * 100
}

export function expectedPercent(loan) {
  const total = loan.totalRepaymentAmount
  const expected = loan.standing?.expectedPaidToDate

  if (!total || total <= 0 || typeof expected !== 'number') return null

  return Math.min(100, Math.max(0, (expected / total) * 100))
}

export function dueNote(loan) {
  const days = loan.standing?.daysRemaining
  if (typeof days !== 'number') return null

  if (days < 0) return `${Math.abs(days)} days overdue`

  return `${days} days left`
}

const TERMINAL_CODES = ['PAID', 'DEFAULTED']

const TERMINAL_LABELS = LOAN_STATUS_OPTIONS.filter((option) =>
  TERMINAL_CODES.includes(option.code),
).map((option) => option.label.toLowerCase())

export function isSettled(loan) {
  return TERMINAL_LABELS.includes((loan?.status ?? '').trim().toLowerCase())
}

const byStart = (a, b) =>
  new Date(a.startDate) - new Date(b.startDate) || a.loanId - b.loanId

const byPaid = (a, b) =>
  new Date(a.paymentDate) - new Date(b.paymentDate) || a.paymentId - b.paymentId

export const LOAN_SORT_OPTIONS = [
  { value: 'latest', label: 'Latest first', compare: (a, b) => byStart(b, a) },
  { value: 'oldest', label: 'Oldest first', compare: byStart },
]

export const PAYMENT_SORT_OPTIONS = [
  { value: 'latest', label: 'Latest first', compare: (a, b) => byPaid(b, a) },
  { value: 'oldest', label: 'Oldest first', compare: byPaid },
]


export const NO_PAYMENT_FILTERS = { from: '', to: '', min: '', max: '' }

export function matchesPaymentFilters(payment, filters) {
  const { from, to, min, max } = filters

  if (from || to) {
    const d = new Date(payment.paymentDate)
    const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate(),
    ).padStart(2, '0')}`

    if (from && day < from) return false
    if (to && day > to) return false
  }

  const low = Number.parseFloat(min)
  if (Number.isFinite(low) && payment.amount < low) return false

  const high = Number.parseFloat(max)
  if (Number.isFinite(high) && payment.amount > high) return false

  return true
}

export function hasPaymentFilters(filters) {
  return Object.values(filters).some((v) => v !== '')
}

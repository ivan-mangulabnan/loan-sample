import './PaymentHistory.css'

const currency = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 2,
})

const date = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

/**
 * What the borrower has actually paid on this loan, newest first.
 *
 * The API returns them oldest first and does not sort by amount, so the reversal happens
 * here: the payment someone is looking for after posting one is the one they just made.
 * Copied before reversing — `reverse()` mutates, and the array belongs to the hook's
 * state.
 *
 * `borrower` is null on this endpoint by design (the reader is the borrower), so it is
 * not a column.
 */
function PaymentHistory({ payments, isLoading, error }) {
  if (error) return <p className="muted">Could not load payments: {error.message}</p>

  if (isLoading && !payments) return <p className="muted">Loading payments…</p>

  const rows = [...(payments ?? [])].reverse()

  if (rows.length === 0)
    return <p className="muted">No payments have been made on this loan yet.</p>

  return (
    <ul className="paylist">
      {rows.map((payment) => (
        <li key={payment.paymentId} className="paylist__row">
          <span className="paylist__date">
            {date.format(new Date(payment.paymentDate))}
          </span>
          <span className="paylist__amount">{currency.format(payment.amount)}</span>
        </li>
      ))}
    </ul>
  )
}

export default PaymentHistory

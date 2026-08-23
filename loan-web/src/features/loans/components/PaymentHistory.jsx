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
 * What the borrower has actually paid on this loan.
 *
 * The API already returns them **newest first** — PaymentService orders
 * `OrderByDescending(PaymentDate).ThenByDescending(PaymentId)`. This file used to
 * `.reverse()` them under a comment claiming the opposite, which quietly rendered the
 * oldest payment at the top: the reverse was the bug, not the fix. Do not add it back.
 *
 * A table, not the list it used to be. Ordering, filtering and paging all live in
 * `ListView` now, and ListView measures its page size from rendered `tbody tr` against
 * `thead` — a `<ul>` gives it nothing to measure. Two aligned columns of dates and
 * money were a table anyway; the list was only ever defensible while the region
 * scrolled and stayed short.
 *
 * `borrower` is null on this endpoint by design (the reader is the borrower), so it is
 * not a column.
 */
function PaymentHistory({ rows }) {
  return (
    <div className="paylist">
      <table className="paylist__table">
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col" className="paylist__num-head">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((payment) => (
            <tr key={payment.paymentId}>
              <td className="paylist__date">
                {date.format(new Date(payment.paymentDate))}
              </td>
              <td className="paylist__amount">{currency.format(payment.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default PaymentHistory

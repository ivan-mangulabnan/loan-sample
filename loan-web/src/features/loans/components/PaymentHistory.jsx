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

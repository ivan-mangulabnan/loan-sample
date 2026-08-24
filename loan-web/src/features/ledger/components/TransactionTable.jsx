import './TransactionTable.css'

const currency = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
  signDisplay: 'exceptZero',
})

function signedAmount(amount) {
  const parts = currency.formatToParts(amount)
  const sign = parts.find((part) => part.type === 'plusSign' || part.type === 'minusSign')

  if (!sign) return currency.format(amount)

  const rest = parts
    .filter((part) => part !== sign)
    .map((part) => part.value)
    .join('')

  return `${sign.value} ${rest}`
}

const date = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

function TransactionTable({ rows }) {
  return (
    <div className="txn">
      <table className="txn__table">
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Type</th>
            <th scope="col">Ref</th>
            <th scope="col" className="txn__amount-head">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.transactionId}>
              <td>{date.format(new Date(row.createdAt))}</td>
              <td>{row.type}</td>
              <td className="txn__ref">#{row.referenceId}</td>
              <td
                className={`txn__amount ${
                  row.amount < 0 ? 'txn__amount--debit' : 'txn__amount--credit'
                }`}
              >
                {signedAmount(row.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TransactionTable

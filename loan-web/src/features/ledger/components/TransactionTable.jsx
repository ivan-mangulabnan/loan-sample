import './TransactionTable.css'

// signDisplay makes the direction explicit on the figure itself: a credit reads
// +₱4,000 and a debit −₱50,000. Colour repeats that, it does not carry it alone.
const currency = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
  signDisplay: 'exceptZero',
})

const date = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

/**
 * The entries behind the ledger balance — TransactionResponse[].
 *
 * A third shape, and its own component rather than a third branch in QueueTable: a
 * transaction has no borrower, no payment plan and no status, so it shares none of that
 * table's six columns. Promotion is on second use (rule 3), and this is the first.
 *
 * `Ref` prints the raw ReferenceId beside the type that gives it meaning. It is an
 * untyped int with no foreign key — pointing at a deposit, a release or a payment
 * depending on the type — so there is nothing to join it to, and the type is what tells
 * the reader which table the number belongs to.
 *
 * Amounts arrive signed and are rendered as they are stored, which is what lets the
 * column sum to the balance shown above it.
 */
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
                {currency.format(row.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TransactionTable

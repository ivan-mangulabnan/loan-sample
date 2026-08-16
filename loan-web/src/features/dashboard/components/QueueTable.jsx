import { ApplicationStatusBadge } from '../../loan-applications/index.js'
import './QueueTable.css'

const currency = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
})

const date = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

/**
 * Renders either queue shape:
 *   'application' — LoanApplicationResponse[] (Reviewer, Approver)
 *   'release'     — FundReleaseQueueResponse[] (Admin)
 */
function QueueTable({ shape, rows }) {
  const isRelease = shape === 'release'

  return (
    <div className="queue">
      <table className="queue__table">
        <thead>
          <tr>
            <th scope="col">Ref</th>
            <th scope="col">Borrower</th>
            <th scope="col">{isRelease ? 'Principal' : 'Amount'}</th>
            <th scope="col">Plan</th>
            <th scope="col">{isRelease ? 'Approved' : 'Requested'}</th>
            <th scope="col">{isRelease ? 'Approver' : 'Status'}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) =>
            isRelease ? (
              <tr key={row.loanApprovalId}>
                <td className="queue__ref">
                  #{row.application.loanApplicationId}
                </td>
                <td>{row.application.borrower}</td>
                <td className="queue__num">
                  {currency.format(row.principalAmount)}
                </td>
                <td>{row.application.paymentPlan}</td>
                <td>{date.format(new Date(row.approvalDate))}</td>
                <td>{row.approver}</td>
              </tr>
            ) : (
              <tr key={row.loanApplicationId}>
                <td className="queue__ref">#{row.loanApplicationId}</td>
                <td>{row.borrower ?? '—'}</td>
                <td className="queue__num">{currency.format(row.amount)}</td>
                <td>{row.paymentPlan?.name ?? '—'}</td>
                <td>{date.format(new Date(row.dateRequested))}</td>
                <td>
                  <ApplicationStatusBadge status={row.status} />
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  )
}

export default QueueTable

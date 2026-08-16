import Progress from '../../../components/Progress.jsx'
import LoanStatusBadge from './LoanStatusBadge.jsx'
import './LoanTable.css'

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

/** Repaid share of the total. Guards the zero total so a malformed row is 0%, not NaN%. */
function repaidPercent(loan) {
  const total = loan.totalRepaymentAmount
  if (!total || total <= 0) return 0
  return ((total - loan.balance) / total) * 100
}

/**
 * daysRemaining is a plain int that keeps counting down past the due date, so a
 * late loan reports a negative. "-12 days" reads as a bug; say what it means.
 */
function dueNote(loan) {
  const days = loan.standing?.daysRemaining
  if (typeof days !== 'number') return null
  if (days < 0) return `${Math.abs(days)} days overdue`
  return `${days} days left`
}

/**
 * A borrower's own loans. Deliberately reads no staff-only field: grade,
 * daysBehind and isGoodPayer are nulled for a Loaner by the API, so "behind
 * schedule" is derived from standing.behindBy instead.
 */
function LoanTable({ rows }) {
  return (
    <div className="loans">
      <table className="loans__table">
        <thead>
          <tr>
            <th scope="col">Ref</th>
            <th scope="col">Principal</th>
            <th scope="col">Balance</th>
            <th scope="col">Repaid</th>
            <th scope="col">Due</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((loan) => {
            const behind = (loan.standing?.behindBy ?? 0) > 0
            const note = dueNote(loan)

            return (
              <tr key={loan.loanId}>
                <td className="loans__ref">#{loan.loanId}</td>
                <td className="loans__num">
                  {currency.format(loan.principalAmount)}
                </td>
                <td className="loans__num">{currency.format(loan.balance)}</td>
                <td className="loans__progress">
                  <Progress
                    value={repaidPercent(loan)}
                    tone={behind ? 'warning' : 'accent'}
                    label={`Repaid on loan #${loan.loanId}`}
                  />
                  {behind && (
                    <span className="loans__progress-note">
                      {currency.format(loan.standing.behindBy)} behind
                    </span>
                  )}
                </td>
                <td>
                  {date.format(new Date(loan.dueDate))}
                  {note && <span className="loans__progress-note">{note}</span>}
                </td>
                <td>
                  <LoanStatusBadge status={loan.status} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default LoanTable

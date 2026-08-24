import Button from '../../../components/Button.jsx'
import LoanStatusBadge from './LoanStatusBadge.jsx'
import { dueNote, repaidPercent } from '../progress.js'
import Progress from '../../../components/Progress.jsx'
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

function LoanTable({ rows, actionLabel, onAction }) {
  const canAct = Boolean(actionLabel && onAction)

  return (
    <div className="loans">
      <table className="loans__table">
        <thead>
          <tr>
            <th scope="col">Ref</th>
            <th scope="col" className="loans__num-head">Principal</th>
            <th scope="col" className="loans__num-head">Balance</th>
            <th scope="col">Repaid</th>
            <th scope="col">Due</th>
            <th scope="col">Status</th>
            {canAct && (
              <th scope="col" className="loans__action">
                <span className="visually-hidden">Action</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((loan) => {
            const behind = (loan.standing?.behindBy ?? 0) > 0
            const note = dueNote(loan)

            return (
              <tr
                key={loan.loanId}
                className={canAct ? 'loans__row--actionable' : undefined}
                onClick={canAct ? () => onAction(loan) : undefined}
              >
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
                    animate
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
                {canAct && (
                  <td className="loans__action">
                    <Button
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation()
                        onAction(loan)
                      }}
                    >
                      {actionLabel}
                    </Button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default LoanTable

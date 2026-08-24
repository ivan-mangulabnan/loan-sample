import Button from '../../../components/Button.jsx'
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

function QueueTable({ shape, rows, hideBorrower = false, actionLabel, onAction, onRowOpen }) {
  const isRelease = shape === 'release'
  const showBorrower = !hideBorrower
  const canAct = Boolean(actionLabel && onAction)
  const canOpen = Boolean(onRowOpen)

  const labelFor = (row) =>
    typeof actionLabel === 'function' ? actionLabel(row) : actionLabel

  const rowProps = (row) => {
    if (canOpen) return { className: 'queue__row--actionable', onClick: () => onRowOpen(row) }

    return canAct && labelFor(row)
      ? { className: 'queue__row--actionable', onClick: () => onAction(row) }
      : null
  }

  const actionCell = (row) => {
    const label = labelFor(row)

    return (
      <td className="queue__action">
        {label && (
          <Button
            size="sm"
            onClick={(event) => {
              event.stopPropagation()
              onAction(row)
            }}
          >
            {label}
          </Button>
        )}
      </td>
    )
  }

  return (
    <div className="queue">
      <table className="queue__table">
        <thead>
          <tr>
            <th scope="col">Ref</th>
            {showBorrower && <th scope="col">Borrower</th>}
            <th scope="col" className="queue__num-head">
              {isRelease ? 'Principal' : 'Amount'}
            </th>
            <th scope="col">Plan</th>
            <th scope="col">{isRelease ? 'Approved' : 'Requested'}</th>
            <th scope="col">{isRelease ? 'Approver' : 'Status'}</th>
            {canAct && (
              <th scope="col" className="queue__action">
                <span className="visually-hidden">Action</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) =>
            isRelease ? (
              <tr key={row.loanApprovalId} {...rowProps(row)}>
                <td className="queue__ref">
                  #{row.application.loanApplicationId}
                </td>
                {showBorrower && <td>{row.application.borrower ?? '—'}</td>}
                <td className="queue__num">
                  {currency.format(row.principalAmount)}
                </td>
                <td>{row.application.paymentPlan}</td>
                <td>{date.format(new Date(row.approvalDate))}</td>
                <td>{row.approver}</td>
                {canAct && actionCell(row)}
              </tr>
            ) : (
              <tr key={row.loanApplicationId} {...rowProps(row)}>
                <td className="queue__ref">#{row.loanApplicationId}</td>
                {showBorrower && <td>{row.borrower ?? '—'}</td>}
                <td className="queue__num">{currency.format(row.amount)}</td>
                <td>{row.paymentPlan?.name ?? '—'}</td>
                <td>{date.format(new Date(row.dateRequested))}</td>
                <td>
                  <ApplicationStatusBadge status={row.status} />
                </td>
                {canAct && actionCell(row)}
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  )
}

export default QueueTable

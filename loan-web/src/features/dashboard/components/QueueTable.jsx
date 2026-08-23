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

/**
 * Renders either queue shape:
 *   'application' — LoanApplicationResponse[] (Reviewer, Approver)
 *   'release'     — FundReleaseQueueResponse[] (Admin)
 *
 * hideBorrower drops that column for a borrower reading their own records:
 * /LoanApplication/me does not include the borrower, so the cell would be a
 * column of dashes, and it is the reader's own name in any case.
 *
 * `actionLabel` + `onAction` add a trailing action column. Opt-in, because most places
 * this table appears are not places you act: the dashboard queue is a preview. Passing
 * neither prop leaves the table exactly as it was.
 *
 * `actionLabel` may be a **function of the row** returning a label or null, for the
 * case /applications forced: one list spanning all eight statuses, where a returned
 * application offers Resubmit, a pending one offers Cancel, and a released one offers
 * nothing. A row whose label is null gets an empty cell and no button.
 *
 * `onRowOpen` is the separate question of whether a row can be *read*. It exists because
 * the two were once the same thing: the row click was wired to `onAction`, so a row with
 * no action was also unopenable — and that silently hid four of the eight application
 * statuses, including Released and Pending Release, the two a borrower most wants to
 * look at. Acting on a record and viewing it are different rights; a settled record is
 * readable forever and actionable never.
 *
 * When `onRowOpen` is passed, every row is clickable regardless of its label, and the
 * action button (when there is one) stops propagation so one click is one destination.
 *
 * `onAction` receives the whole row, not an id — the two shapes are keyed differently
 * (loanApplicationId vs loanApprovalId) and picking the right one is the caller's job.
 * This table stays ignorant of what the action means (rule 4).
 */
function QueueTable({ shape, rows, hideBorrower = false, actionLabel, onAction, onRowOpen }) {
  const isRelease = shape === 'release'
  const showBorrower = !hideBorrower
  const canAct = Boolean(actionLabel && onAction)
  const canOpen = Boolean(onRowOpen)

  // One resolution point for both forms of the prop, so nothing below has to care
  // which one the caller passed.
  const labelFor = (row) =>
    typeof actionLabel === 'function' ? actionLabel(row) : actionLabel

  // The row click is a convenience on top of the button, never instead of it: the button
  // is what a keyboard or a screen reader reaches, so nothing is lost by ignoring the row.
  //
  // onRowOpen wins when both are given. Opening a record is the safe, always-available
  // reading of a click; firing a write — a cancellation, say — because someone clicked a
  // row to look at it is not. The button remains the way to act.
  const rowProps = (row) => {
    if (canOpen) return { className: 'queue__row--actionable', onClick: () => onRowOpen(row) }

    return canAct && labelFor(row)
      ? { className: 'queue__row--actionable', onClick: () => onAction(row) }
      : null
  }

  // Without stopPropagation a click on the button fires the row handler too, opening
  // and immediately reopening the same dialog.
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

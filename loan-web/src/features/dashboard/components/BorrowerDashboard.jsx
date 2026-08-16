import { useNavigate } from 'react-router-dom'
import Callout from '../../../components/Callout.jsx'
import { useMyApplications } from '../../loan-applications/index.js'
import { LoanTable, useMyLoans } from '../../loans/index.js'
import QueueTable from './QueueTable.jsx'
import StatTile from './StatTile.jsx'

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

/** A loan still owing money. "Fully Paid" is the settled label — not "Paid". */
function isOpen(loan) {
  return loan.status?.trim().toLowerCase() !== 'fully paid'
}

function sum(rows, pick) {
  return rows.reduce((total, row) => total + (pick(row) ?? 0), 0)
}

/** Soonest due date among open loans, or null when there are none. */
function nextDue(loans) {
  const times = loans
    .filter(isOpen)
    .map((loan) => new Date(loan.dueDate).getTime())
    .filter((time) => !Number.isNaN(time))

  return times.length ? new Date(Math.min(...times)) : null
}

/**
 * Overview for a borrower: their own applications and loans, not a work queue.
 * Reads no staff-only field — the API nulls grade, daysBehind and isGoodPayer
 * for a Loaner, so "behind schedule" comes from standing.behindBy.
 */
function BorrowerDashboard({ config }) {
  const navigate = useNavigate()
  const loans = useMyLoans()
  const applications = useMyApplications()

  const loanRows = loans.data ?? []
  const applicationRows = applications.data ?? []

  const openLoans = loanRows.filter(isOpen)
  const outstanding = sum(openLoans, (loan) => loan.balance)
  const behindBy = sum(loanRows, (loan) => loan.standing?.behindBy)
  const due = nextDue(loanRows)

  return (
    <>
      <header>
        <h1 className="heading">{config.title}</h1>
        <p className="muted">{config.subtitle}</p>
      </header>

      {loans.error && (
        <Callout action="Retry" onAction={loans.reload}>
          Could not load your loans: {loans.error.message}
        </Callout>
      )}

      {behindBy > 0 && (
        <Callout action="View my loans" onAction={() => navigate('/loans')}>
          You are {currency.format(behindBy)} behind on your repayment schedule.
        </Callout>
      )}

      <section>
        <p className="section-label">Summary</p>
        <div className="stats">
          <StatTile
            tone="accent"
            glyph="◈"
            label="Outstanding"
            value={currency.format(outstanding)}
            isLoading={loans.isLoading}
          />
          <StatTile
            tone="info"
            glyph="▤"
            label="Active loans"
            value={openLoans.length}
            isLoading={loans.isLoading}
          />
          <StatTile
            tone={behindBy > 0 ? 'warning' : 'success'}
            glyph={behindBy > 0 ? '⚠' : '✓'}
            label="Behind by"
            value={currency.format(behindBy)}
            isLoading={loans.isLoading}
          />
          <StatTile
            tone="info"
            glyph="◷"
            label="Next due"
            value={due ? date.format(due) : '—'}
            isLoading={loans.isLoading}
          />
        </div>
      </section>

      <section className="dashboard__queue">
        <p className="section-label">My loans</p>
        {loans.isLoading ? (
          <p className="muted">Loading…</p>
        ) : loanRows.length === 0 ? (
          <p className="muted">{config.collections.loans.emptyMessage}</p>
        ) : (
          <LoanTable rows={loanRows} />
        )}
      </section>

      <section className="dashboard__queue">
        <p className="section-label">My applications</p>
        {applications.isLoading ? (
          <p className="muted">Loading…</p>
        ) : applicationRows.length === 0 ? (
          <p className="muted">{config.collections.applications.emptyMessage}</p>
        ) : (
          // hideBorrower: /LoanApplication/me does not include the borrower, and
          // it is the reader's own name regardless.
          <QueueTable shape="application" rows={applicationRows} hideBorrower />
        )}
      </section>
    </>
  )
}

export default BorrowerDashboard

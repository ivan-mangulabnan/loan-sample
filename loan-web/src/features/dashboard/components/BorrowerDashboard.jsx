import { useNavigate } from 'react-router-dom'
import AreaChart from '../../../components/AreaChart.jsx'
import Callout from '../../../components/Callout.jsx'
import { useSession } from '../../auth/index.js'
import { useMyApplications } from '../../loan-applications/index.js'
import { LoanTable, useMyLoans } from '../../loans/index.js'
import { useDashboardStats } from '../hooks.js'
import DashboardAside from './DashboardAside.jsx'
import QueueTable from './QueueTable.jsx'
import './StaffDashboard.css'

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

const weekday = new Intl.DateTimeFormat(undefined, { weekday: 'short' })

/**
 * Decides the single notice at the top. The order matters: someone with no loan is
 * being invited to apply, and telling them about a payment they cannot make would be
 * nonsense — so `hasLoan` is checked before any repayment figure.
 *
 * Figures come from /Stats/me, including behindBy, which the server computes with the
 * same LoanStanding used by /Loan/me. Deriving it here as well would give the callout
 * and the loans page two ways to disagree.
 */
function noticeFor(stats) {
  if (!stats) return null

  if (!stats.hasLoan) {
    return {
      message: 'You have no loans yet. Apply for one to get started.',
      action: 'Apply for a loan',
      // /applications, not /applications/new — there is no new-application route yet,
      // and a callout that lands on a 404 is worse than one that lands a click short.
      to: '/applications',
    }
  }

  if (stats.behindBy > 0) {
    return {
      message: `You are ${currency.format(stats.behindBy)} behind on your repayment schedule.`,
      action: 'Make a payment',
      to: '/loans',
    }
  }

  // Settled loans only: nothing outstanding and nothing due.
  if (stats.outstanding <= 0) {
    return {
      message: 'You are all paid up. Nothing is outstanding.',
      action: 'View my loans',
      to: '/loans',
    }
  }

  const due = stats.nextDueDate ? date.format(new Date(stats.nextDueDate)) : null

  return {
    message: due
      ? `${currency.format(stats.outstanding)} outstanding, next due ${due}.`
      : `${currency.format(stats.outstanding)} outstanding.`,
    action: 'Make a payment',
    to: '/loans',
  }
}

/**
 * Overview for a borrower: their own payments, loans and applications. Same layout as
 * the staff dashboard — headline, chart, aside — but every figure is their own, and it
 * reads no staff-only field. The API nulls grade, daysBehind and isGoodPayer for a
 * Loaner, and /Stats/me carries no pipeline at all.
 */
function BorrowerDashboard({ config }) {
  const navigate = useNavigate()
  const { name } = useSession()

  const stats = useDashboardStats(config.stats)
  const loans = useMyLoans()
  const applications = useMyApplications()

  const data = stats.data
  const loanRows = loans.data ?? []
  const applicationRows = applications.data ?? []

  const notice = stats.isLoading ? null : noticeFor(data)

  const points = (data?.series ?? []).map((p) => ({
    label: weekday.format(new Date(p.date)),
    value: p.amount,
  }))

  return (
    <div className="staff">
      <div className="staff__main">
        <header className="page-head">
          <div>
            <h1 className="heading">{config.title}</h1>
            <p className="staff__subtitle">{config.subtitle}</p>
          </div>
        </header>

        {stats.error && (
          <Callout action="Retry" onAction={stats.reload}>
            Could not load your overview: {stats.error.message}
          </Callout>
        )}

        {notice && (
          <Callout action={notice.action} onAction={() => navigate(notice.to)}>
            {notice.message}
          </Callout>
        )}

        <section className="staff__headline">
          <p className="staff__figure">
            {stats.isLoading ? '—' : currency.format(data?.headlineAmount ?? 0)}
          </p>
          <p className="staff__caption">
            <span className="dot dot--sm" />
            {stats.isLoading ? 'Loading…' : (data?.headlineCaption ?? '')}
          </p>
        </section>

        {stats.isLoading ? (
          <p className="muted">Loading…</p>
        ) : (
          <AreaChart
            points={points}
            format={(v) => currency.format(v)}
            tone="accent"
            caption={config.stats.chartCaption}
            emptyMessage={config.stats.emptyChartMessage}
          />
        )}

        <section className="staff__queue">
          <p className="section-label">My loans</p>
          {loans.isLoading ? (
            <p className="muted">Loading…</p>
          ) : loanRows.length === 0 ? (
            <p className="muted">{config.collections.loans.emptyMessage}</p>
          ) : (
            <LoanTable rows={loanRows} />
          )}
        </section>

        <section className="staff__queue">
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
      </div>

      {/* No `pipeline`: those are tenant-wide staff counts and /Stats/me does not
          return them, so the section is skipped rather than passed an empty array. */}
      <DashboardAside
        name={name}
        role={config.label}
        averageLabel="Average payment"
        averageValue={data?.averagePayment ?? 0}
        trend={data?.averageTrend ?? []}
        trendCaption="Your average payment by month"
        format={(v) => currency.format(v)}
        isLoading={stats.isLoading}
      />
    </div>
  )
}

export default BorrowerDashboard

import { useNavigate } from 'react-router-dom'
import AreaChart from '../../../components/AreaChart.jsx'
import Callout from '../../../components/Callout.jsx'
import { useSession } from '../../auth/index.js'
import { useDashboardStats } from '../hooks.js'
import DashboardAside from './DashboardAside.jsx'
import DashboardGreeting from './DashboardGreeting.jsx'
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
 *
 * It carries no tables. The "My loans" and "My applications" sections here were a second
 * copy of /loans and /applications — both already in the rail, both now paged and
 * searchable — and their only real effect was to make the overview scroll. The callout
 * above still links into them.
 */
function BorrowerDashboard({ config }) {
  const navigate = useNavigate()
  const { name } = useSession()

  const stats = useDashboardStats(config.stats)

  const data = stats.data

  const notice = stats.isLoading ? null : noticeFor(data)

  const points = (data?.series ?? []).map((p) => ({
    label: weekday.format(new Date(p.date)),
    value: p.amount,
  }))

  return (
    <div className="staff">
      <div className="staff__main">
        <DashboardGreeting subtitle={config.dashboardSubtitle} />

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

        {/* Chart with its header, one sentence — see StaffDashboard. */}
        <section className="staff__chart">
          <p className="staff__headline">
            <span className="dot dot--sm staff__key" />
            <span className="staff__figure">
              {stats.isLoading ? '—' : currency.format(data?.headlineAmount ?? 0)}
            </span>
            {stats.isLoading ? '' : ` ${data?.headlineCaption ?? ''}`}
          </p>

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

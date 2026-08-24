import { useNavigate } from 'react-router-dom'
import AreaChart from '../../../components/AreaChart.jsx'
import Callout from '../../../components/Callout.jsx'
import Skeleton from '../../../components/Skeleton.jsx'
import { useDeferredPending } from '../../../hooks/useDeferredPending.js'
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

function noticeFor(stats) {
  if (!stats) return null

  if (!stats.hasLoan) {
    return {
      message: 'You have no loans yet. Apply for one to get started.',
      action: 'Apply for a loan',
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

function BorrowerDashboard({ config }) {
  const navigate = useNavigate()
  const { name } = useSession()

  const stats = useDashboardStats(config.stats)

  const data = stats.data

  const statsPending = useDeferredPending(stats.isLoading)
  const showStats = !statsPending && !stats.isLoading

  const notice = showStats ? noticeFor(data) : null

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

        {statsPending && <Skeleton variant="callout" />}

        {notice && (
          <div key="notice" className="staff__arrive staff__arrive--notice">
            <Callout action={notice.action} onAction={() => navigate(notice.to)}>
              {notice.message}
            </Callout>
          </div>
        )}

        <section className="staff__chart">
          <p className="staff__headline">
            <span className="dot dot--sm staff__key" />
            {showStats ? (
              <span key="headline" className="staff__arrive">
                <span className="staff__figure">
                  {currency.format(data?.headlineAmount ?? 0)}
                </span>
                {` ${data?.headlineCaption ?? ''}`}
              </span>
            ) : statsPending ? (
              <Skeleton variant="figure" className="staff__figure" width="9ch" />
            ) : null}
          </p>

          {showStats ? (
            <div key="chart" className="staff__arrive staff__arrive--chart">
              <AreaChart
                points={points}
                format={(v) => currency.format(v)}
                tone="accent"
                caption={config.stats.chartCaption}
                emptyMessage={config.stats.emptyChartMessage}
              />
            </div>
          ) : statsPending ? (
            <Skeleton variant="chart" />
          ) : null}
        </section>
      </div>

      <DashboardAside
        name={name}
        role={config.label}
        averageLabel="Average payment"
        averageValue={data?.averagePayment ?? 0}
        trend={data?.averageTrend ?? []}
        trendCaption="Your average payment by month"
        format={(v) => currency.format(v)}
        hasData={showStats}
        isPending={statsPending}
      />
    </div>
  )
}

export default BorrowerDashboard

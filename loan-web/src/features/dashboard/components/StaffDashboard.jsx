import { useNavigate } from 'react-router-dom'
import AreaChart from '../../../components/AreaChart.jsx'
import Callout from '../../../components/Callout.jsx'
import { useSession } from '../../auth/index.js'
import { useDashboardStats, useRoleQueue } from '../hooks.js'
import DashboardAside from './DashboardAside.jsx'
import './StaffDashboard.css'

const currency = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
})

const weekday = new Intl.DateTimeFormat(undefined, { weekday: 'short' })

/**
 * Overview for a staff role: headline, trend and pipeline. The work list itself is not
 * repeated here — it has its own area page (/review, /approvals, /releases), and the
 * duplicate made the dashboard scroll. The queue is still read for the "nothing is
 * waiting" notice, which links through to that page.
 *
 * Figures come from /Stats/dashboard rather than being derived client-side, so the
 * numbers here and in any report agree by construction.
 */
function StaffDashboard({ config }) {
  const navigate = useNavigate()
  const { name } = useSession()

  const queue = useRoleQueue(config.queue)
  const stats = useDashboardStats(config.stats)
  const data = stats.data

  // The notice covers both desks, not just the clear one. Previously it appeared only on
  // an empty queue, which meant the role most likely to have work — the Reviewer — was
  // the one role that never saw it at all.
  const waiting = (queue.data ?? []).length
  const showQueueNotice = !queue.isLoading && !queue.error
  const queueMessage =
    waiting === 0
      ? config.queue.emptyMessage
      : `${waiting} ${waiting === 1 ? config.queue.unit : config.queue.unitPlural} waiting.`

  const isAmount = config.stats?.headline === 'amount'
  const headline = data
    ? isAmount
      ? currency.format(data.headlineAmount)
      : data.headlineCount
    : '—'

  const points = (data?.series ?? []).map((p) => ({
    label: weekday.format(new Date(p.date)),
    value: isAmount ? p.amount : p.count,
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
            Could not load the overview: {stats.error.message}
          </Callout>
        )}

        {showQueueNotice && (
          <Callout
            action={config.queue.calloutAction}
            onAction={() => navigate(config.queue.calloutTo)}
          >
            {queueMessage}
          </Callout>
        )}

        <section className="staff__headline">
          <p className="staff__figure">{stats.isLoading ? '—' : headline}</p>
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
            format={(v) => (isAmount ? currency.format(v) : v)}
            tone={isAmount ? 'accent' : 'info'}
            caption={config.stats.chartCaption}
            emptyMessage={config.stats.emptyChartMessage}
          />
        )}
      </div>

      <DashboardAside
        name={name}
        role={config.label}
        pipeline={data?.pipeline ?? []}
        averageValue={data?.averageLoanSize ?? 0}
        trend={data?.averageTrend ?? []}
        format={(v) => currency.format(v)}
        isLoading={stats.isLoading}
      />
    </div>
  )
}

export default StaffDashboard

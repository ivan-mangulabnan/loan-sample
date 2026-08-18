import { useNavigate } from 'react-router-dom'
import AreaChart from '../../../components/AreaChart.jsx'
import Callout from '../../../components/Callout.jsx'
import { useSession } from '../../auth/index.js'
import { useDashboardStats, useRoleQueue } from '../hooks.js'
import DashboardAside from './DashboardAside.jsx'
import DashboardGreeting from './DashboardGreeting.jsx'
import './StaffDashboard.css'

// The dashboard wants the queue's size, not its contents — the rows have their own area
// page. Asking for one row rather than the default twenty keeps the count exact (it comes
// from totalCount either way) without dragging a page of joined detail along with it.
const COUNT_ONLY = { pageSize: 1 }

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

  const queue = useRoleQueue(config.queue, COUNT_ONLY)
  const stats = useDashboardStats(config.stats)
  const data = stats.data

  // The notice covers both desks, not just the clear one. Previously it appeared only on
  // an empty queue, which meant the role most likely to have work — the Reviewer — was
  // the one role that never saw it at all.
  //
  // totalCount, not items.length: the rows are one page now, so counting them would cap
  // the notice at the page size and tell a Reviewer with 40 waiting that 20 are.
  const waiting = queue.data?.totalCount ?? 0
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
        <DashboardGreeting subtitle={config.dashboardSubtitle} />

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

        {/* The chart and its header, as one block. The header is one sentence —
            "5 reviews posted this week" — because the figure and what it counts are a
            single fact: held apart, on two rows or on one row with a separator, it left a
            bare "5" standing on its own with the answer beside it. The server writes the
            caption as a sentence tail so it reads on from the number. */}
        <section className="staff__chart">
          <p className="staff__headline">
            <span className="dot dot--sm staff__key" />
            <span className="staff__figure">{stats.isLoading ? '—' : headline}</span>
            {stats.isLoading ? '' : ` ${data?.headlineCaption ?? ''}`}
          </p>

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
        </section>
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

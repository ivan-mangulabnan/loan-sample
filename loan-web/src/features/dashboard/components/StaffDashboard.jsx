import { useNavigate } from 'react-router-dom'
import AreaChart from '../../../components/AreaChart.jsx'
import Callout from '../../../components/Callout.jsx'
import Skeleton from '../../../components/Skeleton.jsx'
import { useDeferredPending } from '../../../hooks/useDeferredPending.js'
import { useSession } from '../../auth/index.js'
import { useDashboardStats, useRoleQueue } from '../hooks.js'
import DashboardAside from './DashboardAside.jsx'
import DashboardGreeting from './DashboardGreeting.jsx'
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
  //
  // The queue arrives whole, so its length IS the number waiting — there is no page size
  // for the count to be capped at. It costs the rows themselves, which is the trade the
  // list endpoints make everywhere: one honest request instead of two clever ones.

  // Each section reports its own pending state, so the page fills in as its own request
  // lands rather than holding everything for the slowest one. On a throttled connection
  // the notice, the chart and the aside used to arrive as one block after the greeting.
  const statsPending = useDeferredPending(stats.isLoading)
  const queuePending = useDeferredPending(queue.isLoading)

  // THREE states, not two. `showStats` is the data; `statsPending` is the placeholder;
  // and when neither is true nothing is drawn at all — the quiet window before the delay
  // elapses, which is where a fast response lives and finishes.
  //
  // Rendering the placeholder as the `else` of `showStats` was the whole bug: during that
  // window `statsPending` is false but `isLoading` is still true, so the deferral gated
  // nothing and the full dashboard skeleton flashed for three frames (192-218ms measured).
  // Held past `isLoading` as well, so a placeholder that did appear cannot be ripped away.
  const showStats = !statsPending && !stats.isLoading

  const waiting = queue.data?.length ?? 0
  const showQueueNotice = !queue.isLoading && !queuePending && !queue.error
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

        {/* Its own placeholder, at the callout's height: without one the chart below
            started higher and was pushed down when the count arrived, which on a slow
            connection is the whole page jumping after the reader has started reading. */}
        {queuePending && <Skeleton variant="callout" />}

        {/* `key` so the fade actually runs: React reuses the node when only its props
            change, and a CSS animation on a reused element does not restart. Keyed on the
            arrival, not on the message — a background reload returning the same count
            must not re-fade (rule 16a). */}
        {showQueueNotice && (
          <div key="notice" className="staff__arrive staff__arrive--notice">
            <Callout
              action={config.queue.calloutAction}
              onAction={() => navigate(config.queue.calloutTo)}
            >
              {queueMessage}
            </Callout>
          </div>
        )}

        {/* The chart and its header, as one block. The header is one sentence —
            "5 reviews posted this week" — because the figure and what it counts are a
            single fact: held apart, on two rows or on one row with a separator, it left a
            bare "5" standing on its own with the answer beside it. The server writes the
            caption as a sentence tail so it reads on from the number. */}
        <section className="staff__chart">
          <p className="staff__headline">
            <span className="dot dot--sm staff__key" />
            {/* The em dash is gone: it was a real character in the sentence, so the line
                read as a finished statement about nothing. A bar says the figure is still
                coming, and the caption stays hidden until there is something to caption.
                Data-first: on a fast response `showStats` is true on the first paint and
                the placeholder branch is never taken at all. */}
            {showStats ? (
              <span key="headline" className="staff__arrive">
                <span className="staff__figure">{headline}</span>
                {` ${data?.headlineCaption ?? ''}`}
              </span>
            ) : statsPending ? (
              // `.staff__figure` on the bar itself, so it is sized by the figure's own
              // --text-3xl line rather than the sentence's --text-xl: without it the
              // headline block measured 26.5px against the real 36px and the chart
              // below started 10px high, then dropped when the number arrived.
              <Skeleton variant="figure" className="staff__figure" width="9ch" />
            ) : null}
          </p>

          {showStats ? (
            <div key="chart" className="staff__arrive staff__arrive--chart">
              <AreaChart
                points={points}
                format={(v) => (isAmount ? currency.format(v) : v)}
                tone={isAmount ? 'accent' : 'info'}
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
        pipeline={data?.pipeline ?? []}
        averageValue={data?.averageLoanSize ?? 0}
        trend={data?.averageTrend ?? []}
        format={(v) => currency.format(v)}
        hasData={showStats}
        isPending={statsPending}
      />
    </div>
  )
}

export default StaffDashboard

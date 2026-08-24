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

function StaffDashboard({ config }) {
  const navigate = useNavigate()
  const { name } = useSession()

  const queue = useRoleQueue(config.queue)
  const stats = useDashboardStats(config.stats)
  const data = stats.data

  const statsPending = useDeferredPending(stats.isLoading)
  const queuePending = useDeferredPending(queue.isLoading)

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

        {queuePending && <Skeleton variant="callout" />}

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

        <section className="staff__chart">
          <p className="staff__headline">
            <span className="dot dot--sm staff__key" />
            {showStats ? (
              <span key="headline" className="staff__arrive">
                <span className="staff__figure">{headline}</span>
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

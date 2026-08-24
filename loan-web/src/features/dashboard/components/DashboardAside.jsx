import BarChart from '../../../components/BarChart.jsx'
import Skeleton from '../../../components/Skeleton.jsx'
import PipelineMetric from './PipelineMetric.jsx'

const monthName = new Intl.DateTimeFormat(undefined, { month: 'long' })

function labelFor(bar) {
  return monthName.format(new Date(bar.year, bar.month - 1, 1))
}

function DashboardAside({
  name,
  role,
  pipeline,
  averageLabel = 'Average loan size',
  averageValue = 0,
  trend = [],
  trendCaption = 'Average approved loan size by month',
  trendLabel = 'Monthly average',
  format,
  hasData,
  isPending,
}) {
  const metrics = pipeline ?? []
  const peak = Math.max(0, ...metrics.map((m) => m.count))

  return (
    <aside className="aside">
      <div className="aside__profile">
        <div className="slot aside__photo">photo</div>
        <div className="aside__identity">
          <p className="aside__name">{name ?? '—'}</p>
          <p className="aside__role">{role}</p>
        </div>
      </div>

      {pipeline && (
        <section>
          <p className="section-label">Pipeline</p>
          {hasData ? (
            <div key="pipeline" className="pipeline staff__arrive staff__arrive--pipeline">
              {metrics.map((metric) => (
                <PipelineMetric
                  key={metric.key}
                  metric={metric}
                  share={peak === 0 ? 0 : (metric.count / peak) * 100}
                  format={format}
                />
              ))}
            </div>
          ) : isPending ? (
            <div className="pipeline">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="pipeline__metric">
                  <div className="pipeline__head">
                    <Skeleton variant="chip" className="icon-chip" />
                    <Skeleton variant="label" />
                  </div>
                  <p className="pipeline__value">
                    <Skeleton variant="figure" width="4ch" />
                  </p>
                  <div className="progress">
                    <Skeleton variant="bar" />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      )}

      <section>
        <p className="section-label">{averageLabel}</p>
        <div className="aside__trend">
          <p className="aside__average">
            {hasData ? (
              format(averageValue)
            ) : isPending ? (
              <Skeleton variant="figure" width="8ch" />
            ) : null}
          </p>
          {hasData ? (
            <div key="trend" className="staff__arrive staff__arrive--trend">
              <BarChart
                bars={trend.map((m) => ({
                  label: labelFor(m),
                  value: m.amount,
                }))}
                format={format}
                caption={trendCaption}
                label={trendLabel}
              />
            </div>
          ) : isPending ? (
            <>
              <Skeleton variant="bars" />
              <p className="bars__caption">
                <Skeleton variant="text" width="11ch" />
              </p>
            </>
          ) : null}
        </div>
      </section>
    </aside>
  )
}

export default DashboardAside

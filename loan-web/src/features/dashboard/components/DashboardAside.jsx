import BarChart from '../../../components/BarChart.jsx'
import PipelineMetric from './PipelineMetric.jsx'

// Full names rather than initials: five bars across the aside leave room for them, and
// "J" is three different months. Built from the response's year+month — the API sends
// ints on purpose, so naming the month is the client's job.
const monthName = new Intl.DateTimeFormat(undefined, { month: 'long' })

function labelFor(bar) {
  return monthName.format(new Date(bar.year, bar.month - 1, 1))
}

/**
 * The dashboard's right-hand column: who is signed in, an optional pipeline grid, and a
 * trend chart. Lives here rather than in AppLayout — every other page must not grow one,
 * and putting it in the shell would make the layout know its own route.
 *
 * Shared by both dashboards. A borrower has no pipeline (that is tenant-wide staff data
 * and /Stats/me does not return it), so `pipeline` is omitted and the section is skipped
 * — the labels differ, but the structure is identical, and two asides would drift.
 */
function DashboardAside({
  name,
  role,
  pipeline,
  averageLabel = 'Average loan size',
  averageValue = 0,
  trend = [],
  trendCaption = 'Average approved loan size by month',
  format,
  isLoading,
}) {
  // Bars are relative to the largest metric in the set; counts alone have no ceiling.
  const metrics = pipeline ?? []
  const peak = Math.max(0, ...metrics.map((m) => m.count))

  return (
    <aside className="aside">
      <div className="aside__profile">
        {/* Placeholder, as in the design — there is no avatar in the API. */}
        <div className="slot aside__photo">photo</div>
        <div className="aside__identity">
          <p className="aside__name">{name ?? '—'}</p>
          <p className="aside__role">{role}</p>
        </div>
      </div>

      {pipeline && (
        <section>
          <p className="section-label">Pipeline</p>
          {isLoading ? (
            <p className="muted">Loading…</p>
          ) : (
            <div className="pipeline">
              {metrics.map((metric) => (
                <PipelineMetric
                  key={metric.key}
                  metric={metric}
                  share={peak === 0 ? 0 : (metric.count / peak) * 100}
                  format={format}
                />
              ))}
            </div>
          )}
        </section>
      )}

      <section>
        <p className="section-label">{averageLabel}</p>
        <div className="aside__trend">
          <p className="aside__average">{format(averageValue)}</p>
          <BarChart
            bars={trend.map((m) => ({
              label: labelFor(m),
              value: m.amount,
            }))}
            format={format}
            caption={trendCaption}
          />
        </div>
      </section>
    </aside>
  )
}

export default DashboardAside

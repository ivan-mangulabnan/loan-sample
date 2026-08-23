import BarChart from '../../../components/BarChart.jsx'
import Skeleton from '../../../components/Skeleton.jsx'
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
  // Short, and deliberately not a third "average": the section label names the figure
  // and the figure states it, so the bars only need to say what a column is. The long
  // sentence above stays as the chart's spoken description.
  trendLabel = 'Monthly average',
  format,
  // Three states, not two: `hasData` draws the real thing, `isPending` draws
  // placeholders, and neither draws nothing at all. That third case is the quiet window
  // before the delay elapses, and collapsing it into "not loaded, so show a skeleton" is
  // what made the whole aside flash on a fast response. The host owns both flags because
  // it owns the request (see StaffDashboard).
  hasData,
  isPending,
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
            /* Four cells, matching PipelineMetric's own three parts — chip + label, the
               figure, the bar. Not an arbitrary number of grey boxes: every staff
               audience returns exactly four metrics (StatsService.BuildPipelineAsync),
               so the 2x2 grid this occupies is the one the real data will occupy, and
               the aside does not resize underneath the reader when it lands. */
            <div className="pipeline">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="pipeline__metric">
                  <div className="pipeline__head">
                    <Skeleton variant="chip" className="icon-chip" />
                    {/* `skel--label`, not width:100%: inside the flex head a percentage
                        resolves against the whole row rather than the space left beside
                        the chip, so the bar overshot the aside by the chip's width and
                        hung 16px off the right edge at 390px. It has to flex into what
                        remains, which is what the real label does by other means. */}
                    <Skeleton variant="label" />
                  </div>
                  <p className="pipeline__value">
                    <Skeleton variant="figure" width="4ch" />
                  </p>
                  {/* The real .progress track, with a skeleton fill inside it: the
                      track's own height and radius come from utilities.css, so the cell
                      ends exactly where the real bar will put it. */}
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
          {/* Not `format(0)` while loading: "₱0" is a figure, and a reader has no way to
              tell a real zero from a placeholder one — it states something false and then
              silently corrects itself. The bar states nothing. */}
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
            /* The bar row AND its caption line: BarChart renders a visible
               `.bars__caption` under the columns, so a placeholder for the row alone
               left the aside 26px short and the column shifted when the chart landed. */
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

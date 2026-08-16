import { useId } from 'react'
import './AreaChart.css'

// A coordinate space, not a pixel size: the SVG scales to its container via CSS, so
// the path maths stays integer-simple without pinning a width (rule 15).
const VIEW_W = 640
// The tick labels live outside the SVG now, so the viewBox is the plot and nothing
// else — top and bottom padding just keep the curve's peak and the marker off the edge.
const VIEW_H = 260
const PAD_X = 46
const PLOT_TOP = 20
const PLOT_BOTTOM = 240
const PLOT_H = PLOT_BOTTOM - PLOT_TOP
const GRID_LINES = 4

/**
 * Each segment's two control points share the x-midpoint of the pair, so the curve is
 * smooth at every knot and cannot overshoot vertically past its neighbours. That last
 * part matters for money: a spline that dips below zero between two positive points
 * draws a debt that does not exist.
 */
function curveThrough(coords) {
  let d = `M ${coords[0].x} ${coords[0].y}`

  for (let i = 0; i < coords.length - 1; i += 1) {
    const midX = (coords[i].x + coords[i + 1].x) / 2
    d += ` C ${midX} ${coords[i].y}, ${midX} ${coords[i + 1].y}, ${coords[i + 1].x} ${coords[i + 1].y}`
  }

  return d
}

function AreaChart({
  points = [],
  format = (value) => value,
  tone = 'accent',
  emptyMessage = 'No activity in this period.',
  caption = 'Activity over time',
}) {
  const gradientId = useId()
  const lineId = `${gradientId}-line`
  const fillId = `${gradientId}-fill`

  if (points.length === 0) return <p className="muted">{emptyMessage}</p>

  const values = points.map((p) => p.value)
  const max = Math.max(0, ...values)

  // The zero-state fix. With every value 0 the span is 0, every y divides by zero and
  // the path renders `M 46 NaN` — an invisible chart plus a silent console error.
  // Forcing a minimum span draws a flat line along the baseline instead, which is the
  // truthful picture of "nothing happened".
  //
  // The 1.15 is headroom. Without it the largest value maps exactly to PLOT_TOP, and
  // the smoothing curve — which bulges past its knots on the way in and out of a peak —
  // is then clipped by the top of the viewBox.
  const span = (max || 1) * 1.15
  const isEmpty = max === 0

  const step = points.length > 1 ? (VIEW_W - PAD_X * 2) / (points.length - 1) : 0
  const x = (i) => (points.length > 1 ? PAD_X + i * step : VIEW_W / 2)
  const y = (v) => PLOT_BOTTOM - (v / span) * PLOT_H

  const coords = points.map((p, i) => ({ x: x(i), y: y(p.value) }))

  // A lone `M` command paints nothing in every browser, so a single point would render
  // a blank box. Marker instead of a path below.
  const hasLine = coords.length > 1
  const peakIndex = values.indexOf(max)

  // One marker either way: the peak when there is a curve, the lone point when there
  // is not. A single point would otherwise render nothing at all, because a lone `M`
  // command has no segment to stroke.
  const marker = isEmpty && hasLine ? null : coords[hasLine ? peakIndex : 0]

  return (
    <figure className="chart">
      {/* "none" so the plot fills its column — the default "meet" letterboxes a wide
          box and uses under half the width. The horizontal stretch that comes with it
          only distorts shapes and glyphs, so the curve and gridlines are drawn here
          while the markers and tick labels live in an unstretched overlay below. */}
      <svg
        className="chart__svg"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
        role="img"
        aria-labelledby={gradientId}
      >
        <title id={gradientId}>{caption}</title>

        <defs>
          {/* useId, not a literal: two charts on one page sharing a defs id makes the
              second silently adopt the first's gradient. */}
          <linearGradient id={lineId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--chart-line-fade)" />
            <stop offset="50%" stopColor={`var(--${tone})`} />
            <stop offset="100%" stopColor="var(--chart-line-fade)" />
          </linearGradient>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`var(--${tone})`} stopOpacity="0.22" />
            <stop offset="100%" stopColor={`var(--${tone})`} stopOpacity="0" />
          </linearGradient>
        </defs>

        {Array.from({ length: GRID_LINES + 1 }, (_, i) => {
          const gy = PLOT_TOP + (PLOT_H / GRID_LINES) * i
          return (
            <line
              key={gy}
              className="chart__grid"
              x1={PAD_X}
              y1={gy}
              x2={VIEW_W - PAD_X}
              y2={gy}
            />
          )
        })}

        {hasLine && !isEmpty && (
          <path
            className="chart__fill"
            d={`${curveThrough(coords)} L ${coords.at(-1).x} ${PLOT_BOTTOM} L ${coords[0].x} ${PLOT_BOTTOM} Z`}
            fill={`url(#${fillId})`}
          />
        )}

        {hasLine && (
          <path
            className="chart__line"
            d={curveThrough(coords)}
            stroke={isEmpty ? 'var(--chart-line-fade)' : `url(#${lineId})`}
          />
        )}

        {!isEmpty && hasLine && (
          <line
            className="chart__rule"
            x1={coords[peakIndex].x}
            y1={coords[peakIndex].y}
            x2={coords[peakIndex].x}
            y2={PLOT_BOTTOM}
          />
        )}
      </svg>

      {/* Outside the stretched SVG so the dot stays a circle and the labels keep their
          proportions. Positioned as percentages of the same coordinate space. */}
      {marker && (
        <span
          className="chart__marker"
          style={{
            left: `${(marker.x / VIEW_W) * 100}%`,
            top: `${(marker.y / VIEW_H) * 100}%`,
            background: `var(--${tone})`,
          }}
        />
      )}

      <div className="chart__ticks" aria-hidden="true">
        {/* Keyed by position: two days in a window can share a label. */}
        {points.map((p, i) => (
          <span key={i} className="chart__tick" style={{ left: `${(x(i) / VIEW_W) * 100}%` }}>
            {p.label}
          </span>
        ))}
      </div>

      {isEmpty && <p className="chart__empty muted">{emptyMessage}</p>}

      {/* role="img" + <title> gives a screen reader the headline; this gives it the
          numbers. Visually hidden rather than display:none — display:none is not read. */}
      <figcaption className="visually-hidden">
        <ul>
          {points.map((p, i) => (
            <li key={i}>
              {p.label}: {format(p.value)}
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  )
}

export default AreaChart

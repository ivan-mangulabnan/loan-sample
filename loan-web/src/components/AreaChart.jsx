import { useId } from 'react'
import './AreaChart.css'

// A coordinate space, not a pixel size: the SVG scales to its container via CSS, so
// the path maths stays integer-simple without pinning a width (rule 15).
const VIEW_W = 640
// The tick and axis labels live outside the SVG, so the viewBox is the plot and nothing
// else — top and bottom padding just keep the curve's peak and the marker off the edge.
const VIEW_H = 260
// A small inset either side so the first and last points, and the tick labels centred
// under them, are not half-clipped by the edge of the plot. The y-axis labels are *not*
// padding inside the viewBox: they sit in their own fixed-width column beside the SVG
// (see --chart-gutter). Reserving room for them here instead would make the gutter a
// percentage of the rendered width — too narrow for "₱224,000" on a phone and a tenth
// of the chart wasted on a desktop, because the SVG is preserveAspectRatio="none".
const PAD_X = 12
const PLOT_TOP = 20
const PLOT_BOTTOM = 240
const PLOT_H = PLOT_BOTTOM - PLOT_TOP
const GRID_LINES = 4

// Steps a reader takes in without decoding: 1, 1.5, 2 … times a power of ten. Without
// this the axis labels come straight off `max * 1.15` and a three-review week is
// labelled "3.4499999999999997" — the identity `format` used for counts does no
// rounding of its own.
const NICE_STEPS = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]

/**
 * The top of the y domain, rounded up so every gridline lands on a round number.
 *
 * Rounding *up* is what keeps the headroom guard: the domain still clears the maximum by
 * at least the old 15%, so the smoothing curve — which bulges past its knots on the way
 * in and out of a peak — is not clipped by the top of the viewBox.
 *
 * `integral` keeps a count axis whole. A series of whole numbers labelled 2.5 and 7.5 is
 * a chart of things that cannot be halved.
 */
function niceSpan(max, integral) {
  const rawStep = (max * 1.15) / GRID_LINES
  const magnitude = 10 ** Math.floor(Math.log10(rawStep))

  const candidates = NICE_STEPS.map((m) => m * magnitude).filter(
    (candidate) => !integral || (candidate >= 1 && Number.isInteger(candidate)),
  )

  // The filter can empty the list when the magnitude is fractional and every candidate
  // rounds away — fall back to the next whole number up.
  const step = candidates.find((candidate) => candidate >= rawStep) ?? Math.ceil(rawStep)

  return step * GRID_LINES
}

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
  // the path renders `M 12 NaN` — an invisible chart plus a silent console error.
  // Forcing a minimum span draws a flat line along the baseline instead, which is the
  // truthful picture of "nothing happened".
  const isEmpty = max === 0
  const span = isEmpty ? 1 : niceSpan(max, values.every(Number.isInteger))

  const plotW = VIEW_W - PAD_X * 2
  const step = points.length > 1 ? plotW / (points.length - 1) : 0
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
  const markerValue = hasLine ? max : values[0]
  // The label takes whichever side of the dot has room, so a peak on the last day does
  // not push its own value off the right edge.
  const markerSide = marker && marker.x > VIEW_W / 2 ? 'start' : 'end'

  // Top gridline first, baseline last — the order they are drawn in. An all-zero chart
  // keeps the baseline label only: a 0.25 / 0.5 / 0.75 axis over a flat line invents a
  // scale that nothing on the page is using.
  const axisTicks = Array.from({ length: GRID_LINES + 1 }, (_, i) => ({
    value: span * (1 - i / GRID_LINES),
    y: PLOT_TOP + (PLOT_H / GRID_LINES) * i,
  })).filter((tick) => !isEmpty || tick.value === 0)

  return (
    <figure className="chart">
      {/* Two columns: a fixed-width gutter for the y-axis labels, and the canvas the SVG
          stretches into. Splitting them is what lets the gutter be a constant width at
          every viewport while the plot stays fluid — and it makes the plot the box the
          marker's percentages resolve against, rather than the whole figure. */}
      <div className="chart__plot">
        {/* The y-axis. Outside the SVG for the same reason the x ticks are:
            preserveAspectRatio="none" would smear the glyphs sideways. Values come off
            the same `span` the curve is scaled by, so a label and the line it sits on
            cannot disagree. */}
        <div className="chart__axis" aria-hidden="true">
          {axisTicks.map((tick) => (
            <span
              key={tick.y}
              className="chart__axis-label"
              style={{ top: `${(tick.y / VIEW_H) * 100}%` }}
            >
              {format(tick.value)}
            </span>
          ))}
        </div>

        <div className="chart__canvas">
          {/* The peak's bloom, under the plot. Not an SVG circle for the same reason the
              marker is not: preserveAspectRatio="none" would stretch it into an ellipse
              whose shape changed with the viewport. Skipped on an all-zero series — a
              glow is emphasis, and there is nothing there to emphasise. */}
          {marker && !isEmpty && (
            <span
              className="chart__glow"
              aria-hidden="true"
              style={{
                left: `${(marker.x / VIEW_W) * 100}%`,
                top: `${(marker.y / VIEW_H) * 100}%`,
                '--chart-glow': `var(--${tone})`,
              }}
            />
          )}

          {/* "none" so the plot fills its column — the default "meet" letterboxes a wide
              box and uses under half the width. The horizontal stretch that comes with it
              only distorts shapes and glyphs, so the curve and gridlines are drawn here
              while the marker and every label live in an unstretched overlay. */}
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
                // Full width: the gridlines start where the axis labels end, so the two
                // read as one axis rather than a floating grid.
                <line key={gy} className="chart__grid" x1="0" y1={gy} x2={VIEW_W} y2={gy} />
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

          {/* Outside the stretched SVG so the dot stays a circle and the label keeps its
              proportions. Positioned as percentages of the same coordinate space. */}
          {marker && (
            <span
              className="chart__marker"
              style={{
                left: `${(marker.x / VIEW_W) * 100}%`,
                top: `${(marker.y / VIEW_H) * 100}%`,
                background: `var(--${tone})`,
              }}
            >
              <span className={`chart__marker-label chart__marker-label--${markerSide}`}>
                {format(markerValue)}
              </span>
            </span>
          )}

            {isEmpty && <p className="chart__empty muted">{emptyMessage}</p>}
        </div>
      </div>

      {/* Indented past the gutter so each label still lines up with its point — the tick
          row spans the canvas, not the figure. */}
      <div className="chart__ticks" aria-hidden="true">
        {/* Keyed by position: two days in a window can share a label. */}
        {points.map((p, i) => (
          <span key={i} className="chart__tick" style={{ left: `${(x(i) / VIEW_W) * 100}%` }}>
            {p.label}
          </span>
        ))}
      </div>

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

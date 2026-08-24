import { useId } from 'react'
import './AreaChart.css'

const VIEW_W = 640
const VIEW_H = 260
const PAD_X = 12
const PLOT_TOP = 20
const PLOT_BOTTOM = 240
const PLOT_H = PLOT_BOTTOM - PLOT_TOP
const GRID_LINES = 4

const NICE_STEPS = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]

function niceSpan(max, integral) {
  const rawStep = (max * 1.15) / GRID_LINES
  const magnitude = 10 ** Math.floor(Math.log10(rawStep))

  const candidates = NICE_STEPS.map((m) => m * magnitude).filter(
    (candidate) => !integral || (candidate >= 1 && Number.isInteger(candidate)),
  )

  const step = candidates.find((candidate) => candidate >= rawStep) ?? Math.ceil(rawStep)

  return step * GRID_LINES
}

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

  const isEmpty = max === 0
  const span = isEmpty ? 1 : niceSpan(max, values.every(Number.isInteger))

  const plotW = VIEW_W - PAD_X * 2
  const step = points.length > 1 ? plotW / (points.length - 1) : 0
  const x = (i) => (points.length > 1 ? PAD_X + i * step : VIEW_W / 2)
  const y = (v) => PLOT_BOTTOM - (v / span) * PLOT_H

  const coords = points.map((p, i) => ({ x: x(i), y: y(p.value) }))

  const hasLine = coords.length > 1
  const peakIndex = values.indexOf(max)

  const marker = isEmpty && hasLine ? null : coords[hasLine ? peakIndex : 0]
  const markerValue = hasLine ? max : values[0]
  const markerSide = marker && marker.x > VIEW_W / 2 ? 'start' : 'end'

  const axisTicks = Array.from({ length: GRID_LINES + 1 }, (_, i) => ({
    value: span * (1 - i / GRID_LINES),
    y: PLOT_TOP + (PLOT_H / GRID_LINES) * i,
  })).filter((tick) => !isEmpty || tick.value === 0)

  return (
    <figure className="chart">
      <div className="chart__plot">
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

          <svg
            className="chart__svg"
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            preserveAspectRatio="none"
            role="img"
            aria-labelledby={gradientId}
          >
            <title id={gradientId}>{caption}</title>

            <defs>
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

      <div className="chart__ticks" aria-hidden="true">
        {points.map((p, i) => (
          <span key={i} className="chart__tick" style={{ left: `${(x(i) / VIEW_W) * 100}%` }}>
            {p.label}
          </span>
        ))}
      </div>

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

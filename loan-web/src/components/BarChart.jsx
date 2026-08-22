import { useId } from 'react'
import './BarChart.css'

// A floor rather than 0: a bar with no height leaves its label orphaned, so an empty
// month still shows a stub to stand under.
const MIN_PERCENT = 4
// Real values start well clear of that stub, so "a little" never looks like "none".
const FLOOR_PERCENT = 18

/**
 * Small vertical bars. CSS heights rather than SVG — height is the only variable, and
 * --bar-vertical already exists for exactly this.
 */
function BarChart({ bars = [], format = (value) => value, caption = 'Trend', label }) {
  // Above the empty-bars return: a hook behind a conditional breaks the moment a chart
  // goes from empty to populated, which with this data is the common transition. Same
  // reason AreaChart reaches for useId — two charts on one page must not name the same
  // node.
  const captionId = useId()

  if (bars.length === 0) return null

  const max = Math.max(0, ...bars.map((b) => b.value))

  return (
    <figure className="bars" role="img" aria-labelledby={captionId}>
      {/* Keyed by position, not label: month initials repeat (J F M A M), and a
          duplicate key makes React drop or duplicate a bar. */}
      <div className="bars__row" aria-hidden="true">
        {bars.map((bar, index) => (
          <div key={index} className="bars__item">
            {/* The bar is measured against the track, not the whole column, so the
                tallest month cannot squeeze its own label out of the row. */}
            <div className="bars__track">
              {/* Zero is a stub; anything above zero is scaled into the band above the
                  floor, so a single non-zero month among empty ones still reads as a
                  bar rather than as marginally taller than nothing. */}
              <div
                className={`bars__bar${bar.value === 0 ? ' bars__bar--empty' : ''}`}
                /* The one thing the chart otherwise never shows: what a single bar is
                   worth. Native, so no JS and no tooltip component — and the row is
                   aria-hidden, so the figcaption below stays the only spoken source
                   and this never becomes a second announcement. */
                title={`${bar.label}: ${format(bar.value)}`}
                style={{
                  height: `${
                    bar.value === 0 || max === 0
                      ? MIN_PERCENT
                      : FLOOR_PERCENT + (bar.value / max) * (100 - FLOOR_PERCENT)
                  }%`,
                }}
              />
            </div>
            <span className="bars__label">{bar.label}</span>
          </div>
        ))}
      </div>

      {/* What the bars are, on screen rather than only in the figcaption. Without it
          the figure above the chart (`.aside__average`) reads as a heading for the
          bars, when it is actually the mean across the months that have a value — and
          nothing told a sighted reader the columns were monthly at all.

          `label` is the short form for the eye; `caption` stays the full sentence and
          leads the figcaption below, so a screen reader still gets the specific
          description ("Average approved loan size by month") rather than only the
          abbreviation. Naming the figure from this node keeps it to one announcement —
          an `aria-label` as well would be a second copy of the same words. */}
      <p className="bars__caption" id={captionId}>{label ?? caption}</p>

      <figcaption className="visually-hidden">
        <p>{caption}</p>
        <ul>
          {bars.map((bar, index) => (
            <li key={index}>
              {bar.label}: {format(bar.value)}
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  )
}

export default BarChart

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
function BarChart({ bars = [], format = (value) => value, caption = 'Trend' }) {
  if (bars.length === 0) return null

  const max = Math.max(0, ...bars.map((b) => b.value))

  return (
    <figure className="bars" role="img" aria-label={caption}>
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

      <figcaption className="visually-hidden">
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

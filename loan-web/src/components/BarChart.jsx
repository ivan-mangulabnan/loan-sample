import { useId } from 'react'
import './BarChart.css'

const MIN_PERCENT = 4
const FLOOR_PERCENT = 18

function BarChart({ bars = [], format = (value) => value, caption = 'Trend', label }) {
  const captionId = useId()

  if (bars.length === 0) return null

  const max = Math.max(0, ...bars.map((b) => b.value))

  return (
    <figure className="bars" role="img" aria-labelledby={captionId}>
      <div className="bars__row" aria-hidden="true">
        {bars.map((bar, index) => (
          <div key={index} className="bars__item">
            <div className="bars__track">
              <div
                className={`bars__bar${bar.value === 0 ? ' bars__bar--empty' : ''}`}
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

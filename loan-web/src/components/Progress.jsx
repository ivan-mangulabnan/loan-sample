import { useEffect, useState } from 'react'

function Progress({ value = 0, tone = 'accent', label, animate = false }) {
  const pct = Math.min(100, Math.max(0, value))

  const [swept, setSwept] = useState(!animate)
  useEffect(() => {
    if (!animate) return

    const frame = requestAnimationFrame(() => setSwept(true))
    return () => cancelAnimationFrame(frame)
  }, [animate, value])

  const moving = animate && swept && pct > 0 && pct < 100

  return (
    <div
      className={`progress${animate ? ' progress--animated' : ''}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className="progress__bar"
        style={{ width: `${swept ? pct : 0}%`, background: `var(--bar-${tone})` }}
      >
        {moving && <span className="progress__comet" />}
      </div>
    </div>
  )
}

export default Progress

import { useEffect, useState } from 'react'

/**
 * value: 0-100. tone selects a --bar-* gradient from tokens.css.
 *
 * animate: sweep the bar out to `value` on mount, then keep it visibly advancing — a
 *   stripe texture inside the fill and a highlight running its length. Opt-in, because
 *   this is only worth the motion where the bar is what the reader came to look at — a
 *   row of them in a table is a column of figures, and animating all of them at once is
 *   a light show. The dashboard's PipelineMetric deliberately leaves it off.
 *
 *   The sweep still runs at 100%, but the repeating motion does not: it says "still
 *   accruing", and a fully repaid loan has nothing left to accrue. A full bar that kept
 *   moving would read as unfinished.
 */
function Progress({ value = 0, tone = 'accent', label, animate = false }) {
  const pct = Math.min(100, Math.max(0, value))

  // Rendered at 0 for one frame so the CSS transition has two states to move between;
  // a transition cannot animate a first paint. Same approach as the loan detail ring.
  const [swept, setSwept] = useState(!animate)
  useEffect(() => {
    if (!animate) return

    const frame = requestAnimationFrame(() => setSwept(true))
    return () => cancelAnimationFrame(frame)
  }, [animate, value])

  // Gates every repeating part at once, so they cannot drift out of agreement about when
  // the bar is still moving.
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
        {/* Inside the bar, so it is clipped to the filled width and travels only as far
            as the value goes — the same "runs out at the end" the ring's comet has. */}
        {moving && <span className="progress__comet" />}
      </div>
    </div>
  )
}

export default Progress

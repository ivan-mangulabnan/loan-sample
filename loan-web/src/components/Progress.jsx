/**
 * value: 0–100. tone selects a --bar-* gradient from tokens.css.
 */
function Progress({ value = 0, tone = 'accent', label }) {
  const pct = Math.min(100, Math.max(0, value))

  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className="progress__bar"
        style={{ width: `${pct}%`, background: `var(--bar-${tone})` }}
      />
    </div>
  )
}

export default Progress

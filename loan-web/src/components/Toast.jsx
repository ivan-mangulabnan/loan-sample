import { useEffect, useRef, useState } from 'react'
import './Toast.css'

/**
 * One transient notice. Reports something that already happened — a write the server
 * accepted — rather than a condition that is still true; a standing condition belongs in
 * a Callout, which stays on the page and can carry an action.
 *
 * It dismisses itself after `duration`, and the bar across the bottom is that countdown
 * made visible: a message that vanishes with no warning reads as a glitch.
 *
 * The timer pauses on hover *and* on focus-within. Hover alone would mean a keyboard
 * user tabbing toward the ✕ watches it disappear before they arrive.
 */
function Toast({ message, tone = 'success', duration = 5000, onDismiss }) {
  const [isPaused, setIsPaused] = useState(false)

  // Kept in a ref rather than state: onDismiss changes identity on every parent render,
  // and depending on it directly would restart the countdown each time.
  const dismissRef = useRef(onDismiss)
  dismissRef.current = onDismiss

  useEffect(() => {
    if (isPaused) return

    const timer = setTimeout(() => dismissRef.current?.(), duration)
    return () => clearTimeout(timer)
  }, [isPaused, duration])

  return (
    <div
      className={`toast toast--${tone}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <p className="toast__text">{message}</p>

      <button
        type="button"
        className="toast__dismiss"
        aria-label="Dismiss"
        onClick={onDismiss}
      >
        ✕
      </button>

      {/* Restarted by the key whenever the pause state flips, so resuming after a hover
          begins a fresh sweep — matching the timer above, which is also restarted. */}
      <span
        key={String(isPaused)}
        className="toast__timer"
        style={{ animationDuration: `${duration}ms`, animationPlayState: isPaused ? 'paused' : 'running' }}
      />
    </div>
  )
}

export default Toast

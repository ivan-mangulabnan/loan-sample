import { useEffect, useRef, useState } from 'react'
import './Toast.css'

function Toast({ message, tone = 'success', duration = 5000, onDismiss }) {
  const [isPaused, setIsPaused] = useState(false)

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

      <span
        key={String(isPaused)}
        className="toast__timer"
        style={{ animationDuration: `${duration}ms`, animationPlayState: isPaused ? 'paused' : 'running' }}
      />
    </div>
  )
}

export default Toast

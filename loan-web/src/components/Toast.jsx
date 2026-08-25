import { useEffect, useRef, useState } from 'react'
import './Toast.css'

const MAX_DEFER_MS = 15000

function Toast({
  message,
  tone = 'success',
  duration = 5000,
  onDismiss,
  onUndo = null,
  undoLabel = 'Undo',
}) {
  const [isPaused, setIsPaused] = useState(false)

  const dismissRef = useRef(onDismiss)
  dismissRef.current = onDismiss

  const isDeferring = useRef(Boolean(onUndo))

  useEffect(() => {
    if (isPaused) return

    const timer = setTimeout(() => dismissRef.current?.(), duration)
    return () => clearTimeout(timer)
  }, [isPaused, duration])

  useEffect(() => {
    if (!isDeferring.current) return

    const cap = setTimeout(() => dismissRef.current?.(), MAX_DEFER_MS)
    return () => clearTimeout(cap)
  }, [])

  return (
    <div
      className={`toast toast--${tone}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <p className="toast__text">{message}</p>

      {onUndo && (
        <button type="button" className="toast__undo" aria-label={undoLabel} onClick={onUndo}>
          Undo
        </button>
      )}

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

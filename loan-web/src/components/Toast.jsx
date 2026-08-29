import { useCallback, useEffect, useRef, useState } from 'react'
import './Toast.css'

const MAX_DEFER_MS = 15000

// Matches --motion-out in tokens.css. The exit is visual only: the pending write is
// committed by the provider when onDismiss finally runs, so a slower exit would
// delay the commit rather than just the fade.
const EXIT_MS = 180

function Toast({
  message,
  tone = 'success',
  duration = 5000,
  onDismiss,
  onUndo = null,
  undoLabel = 'Undo',
  // Forced from above when the provider is retiring the whole stack (sign-out). It
  // only plays the exit — the provider owns removal in that case, so this must not
  // call onDismiss or the write would be resolved twice.
  leaving = false,
}) {
  const [isPaused, setIsPaused] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  const dismissRef = useRef(onDismiss)
  dismissRef.current = onDismiss

  const isDeferring = useRef(Boolean(onUndo))

  // Play the exit, then hand back to the provider. Guarded so a second trigger —
  // the timer landing while the reader is already clicking ✕ — cannot start two
  // exits or fire onDismiss twice.
  const leavingRef = useRef(false)
  const leave = useCallback(() => {
    if (leavingRef.current) return

    leavingRef.current = true
    setIsLeaving(true)

    setTimeout(() => dismissRef.current?.(), EXIT_MS)
  }, [])

  const isExiting = isLeaving || leaving

  useEffect(() => {
    if (isPaused || isExiting) return

    const timer = setTimeout(leave, duration)
    return () => clearTimeout(timer)
  }, [isPaused, isExiting, duration, leave])

  useEffect(() => {
    if (!isDeferring.current || leaving) return

    const cap = setTimeout(leave, MAX_DEFER_MS)
    return () => clearTimeout(cap)
  }, [leave, leaving])

  return (
    <div
      className={`toast toast--${tone}${isExiting ? ' toast--leaving' : ''}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <p className="toast__text">{message}</p>

      {/* Undo cancels the write, so it must reach the provider immediately — the
          exit plays on the way out rather than in front of it. */}
      {onUndo && (
        <button type="button" className="toast__undo" aria-label={undoLabel} onClick={onUndo}>
          Undo
        </button>
      )}

      <button
        type="button"
        className="toast__dismiss"
        aria-label="Dismiss"
        onClick={leave}
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

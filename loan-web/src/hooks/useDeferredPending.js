import { useEffect, useRef, useState } from 'react'

// Below this, a load is not worth reporting. The endpoint itself answers in 7-35ms
// locally, but that is not the number to size against: a dashboard's request cannot even
// start until /Auth/me has resolved the session, so the gap between opening the page and
// having data is ~230ms. At a 250ms threshold the timer expired *just* as the data
// landed and the whole dashboard skeleton flashed for three frames (216-264ms measured)
// — the exact flicker this hook exists to remove. 400ms clears that comfortably while
// staying well inside the ~1s at which a wait starts to feel unacknowledged.
const APPEAR_AFTER_MS = 400

// Once shown, it stays at least this long. Without it the delay above just moves the
// problem: a 260ms response paints the skeleton and removes it 10ms later, which is the
// same flicker with an extra step. Roughly the length of the app's swap animation, so a
// placeholder lives for about as long as the fade that replaces it.
const HOLD_FOR_MS = 400

/**
 * Whether a pending state has lasted long enough to be worth showing.
 *
 * Two thresholds, because a naive `isLoading` fails at both ends. It stays false for a
 * fast response so nothing is ever drawn, and once true it stays true briefly after the
 * data lands so the placeholder cannot be ripped away mid-blink.
 *
 * The point is that a loading indicator is a promise that waiting is happening. On a
 * response the reader experiences as instant, that promise is a lie told in two frames.
 *
 * Timers are cleared on unmount and whenever `isPending` flips, so a component that
 * mounts and leaves inside the delay never schedules a state update into nothing.
 */
export function useDeferredPending(isPending) {
  const [isVisible, setIsVisible] = useState(false)

  // When the placeholder actually appeared, so the hold below is measured from the
  // moment it went on screen rather than from the moment the request started.
  const shownAt = useRef(0)

  useEffect(() => {
    if (isPending) {
      // Already up from a previous cycle — leave it, and leave `shownAt` alone so a
      // reload does not restart the hold.
      if (isVisible) return

      const timer = setTimeout(() => {
        shownAt.current = Date.now()
        setIsVisible(true)
      }, APPEAR_AFTER_MS)

      return () => clearTimeout(timer)
    }

    // Settled before the delay elapsed: nothing was ever shown, so there is nothing to
    // hold and nothing to clear up.
    if (!isVisible) return

    const elapsed = Date.now() - shownAt.current
    const remaining = HOLD_FOR_MS - elapsed

    if (remaining <= 0) {
      setIsVisible(false)
      return
    }

    const timer = setTimeout(() => setIsVisible(false), remaining)

    return () => clearTimeout(timer)
  }, [isPending, isVisible])

  return isVisible
}

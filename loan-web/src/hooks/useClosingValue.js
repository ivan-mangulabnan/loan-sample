import { useEffect, useRef, useState } from 'react'

// Matches --motion-out in tokens.css, and Modal's own EXIT_MS.
const EXIT_MS = 180

/**
 * Keeps the last non-null value alive for the length of the modal exit.
 *
 * Every modal wrapper guards its body with `if (!row) return null`, because the body
 * dereferences the row (`loan.balance`, `release.principalAmount`). That guard fires
 * the instant the page clears its target — which unmounts `<Modal>` before it can
 * play its exit, so the dialog vanished abruptly no matter what `Modal` did about it.
 *
 * Returning the retained value lets the wrapper keep rendering its real content while
 * closing, with `open` false so `Modal` runs the exit. Null only after it has played.
 */
export function useClosingValue(value) {
  const [retained, setRetained] = useState(value ?? null)

  const timer = useRef(null)

  useEffect(() => {
    if (value) {
      clearTimeout(timer.current)
      setRetained(value)
      return
    }

    // Already cleared — nothing to hold on to, and no exit to wait for.
    if (!retained) return

    timer.current = setTimeout(() => setRetained(null), EXIT_MS)

    return () => clearTimeout(timer.current)
  }, [value, retained])

  return retained
}

/**
 * Freezes a value while the modal is closing.
 *
 * A successful write clears the target and resets `isSubmitting` in the same commit,
 * so a modal that lingers for its exit would show its button snap from "Posting…"
 * back to "Post payment" on the way out. Nothing about the dialog should still be
 * changing once it has been dismissed: this holds the last value it had while open.
 */
export function useClosingProp(value, isOpen) {
  const held = useRef(value)

  if (isOpen) held.current = value

  return isOpen ? value : held.current
}

/**
 * Drives a `.reveal` block that has to animate closed as well as open.
 *
 * Returns `[isMounted, className]`. The block stays mounted for `--motion-out` after
 * its content goes away, wearing `reveal--leaving` so the row can collapse; CSS alone
 * cannot do it, because a removed element has nothing left to animate.
 *
 * Reopening mid-close cancels cleanly — the timer is cleared and the class dropped.
 */
export function useRevealed(isShown) {
  const [isMounted, setIsMounted] = useState(isShown)
  const [isLeaving, setIsLeaving] = useState(false)

  const timer = useRef(null)

  useEffect(() => {
    if (isShown) {
      clearTimeout(timer.current)
      setIsMounted(true)
      setIsLeaving(false)
      return
    }

    if (!isMounted) return

    setIsLeaving(true)
    timer.current = setTimeout(() => {
      setIsMounted(false)
      setIsLeaving(false)
    }, EXIT_MS)

    return () => clearTimeout(timer.current)
  }, [isShown, isMounted])

  return [isMounted, `reveal${isLeaving ? ' reveal--leaving' : ''}`]
}

/**
 * Clears a modal's form every time it opens.
 *
 * The pages used to do this with `key={target?.id}` at the call site, but that key
 * goes undefined the moment the target clears — remounting the modal mid-exit and
 * throwing away the very state that keeps it on screen. Same job, done on the way in
 * rather than on the way out.
 *
 * Keyed on *opening*, not on which row. A first attempt fired only when the row id
 * changed, which misses the commonest case of all: paying a loan and then reopening
 * the same loan, where the amount just posted was still sitting in the field.
 * Reopening is what the reader experiences as a fresh start, same row or not.
 *
 * Pass a boolean for modals with no row (`ApplyModal`, `DepositModal`), and
 * `Boolean(row)` for the rest.
 */
export function useResetOnOpen(isOpen, reset) {
  const wasOpen = useRef(isOpen)

  useEffect(() => {
    if (isOpen && !wasOpen.current) reset()

    wasOpen.current = isOpen
  }, [isOpen, reset])
}

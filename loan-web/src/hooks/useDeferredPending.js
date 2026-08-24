import { useEffect, useRef, useState } from 'react'

const APPEAR_AFTER_MS = 400

const HOLD_FOR_MS = 400

export function useDeferredPending(isPending) {
  const [isVisible, setIsVisible] = useState(false)

  const shownAt = useRef(0)

  useEffect(() => {
    if (isPending) {
      if (isVisible) return

      const timer = setTimeout(() => {
        shownAt.current = Date.now()
        setIsVisible(true)
      }, APPEAR_AFTER_MS)

      return () => clearTimeout(timer)
    }

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

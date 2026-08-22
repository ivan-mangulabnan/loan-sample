import { useCallback, useMemo, useRef, useState } from 'react'
import ToastStack from './ToastStack.jsx'
import { ToastContext } from './ToastContextValue.js'

// Older toasts drop off rather than filling the column. Acting on a run of rows should
// not build a wall over the list being worked through.
const MAX_VISIBLE = 3

/**
 * Holds the live toasts for the whole session.
 *
 * Mounted above the router so a notice survives navigation: releasing funds sends the
 * reader back to a queue that no longer holds the row, and the confirmation should not
 * be lost in the transition that proves it worked.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  // A counter, not a timestamp: two writes can resolve in the same millisecond, and
  // Date.now() would hand them the same React key.
  const nextId = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback(({ message, tone }) => {
    const id = nextId.current++

    setToasts((current) => [...current, { id, message, tone }].slice(-MAX_VISIBLE))

    return id
  }, [])

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

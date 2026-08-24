import { useCallback, useMemo, useRef, useState } from 'react'
import ToastStack from './ToastStack.jsx'
import { ToastContext } from './ToastContextValue.js'

const MAX_VISIBLE = 3

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

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

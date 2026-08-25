import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ToastStack from './ToastStack.jsx'
import { ToastContext } from './ToastContextValue.js'
import { setUnloading } from '../lib/apiClient.js'

const MAX_VISIBLE = 3

const NO_KEYS = new Set()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [pendingKeys, setPendingKeys] = useState(NO_KEYS)

  const nextId = useRef(0)

  const pending = useRef(new Map())

  const visible = useRef([])

  const syncKeys = useCallback(() => {
    const keys = new Set()

    for (const entry of pending.current.values())
      if (entry.key !== null && entry.key !== undefined) keys.add(entry.key)

    setPendingKeys(keys.size === 0 ? NO_KEYS : keys)
  }, [])

  const remove = useCallback((id) => {
    visible.current = visible.current.filter((toast) => toast.id !== id)
    setToasts(visible.current)
  }, [])

  const resolve = useCallback(
    (id, { cancel = false } = {}) => {
      const entry = pending.current.get(id)

      remove(id)

      if (!entry) return

      pending.current.delete(id)
      syncKeys()

      if (!cancel) entry.commit()
    },
    [remove, syncKeys],
  )

  const push = useCallback(
    ({ message, tone, duration, commit = null, key = null, undoLabel }) => {
      const id = nextId.current++

      if (commit) {
        pending.current.set(id, { commit, key })
        syncKeys()
      }

      const next = [
        ...visible.current,
        { id, message, tone, duration, undoLabel, undoable: Boolean(commit) },
      ]

      const overflow = next.slice(0, Math.max(0, next.length - MAX_VISIBLE))

      visible.current = next.slice(-MAX_VISIBLE)
      setToasts(visible.current)

      for (const toast of overflow) resolve(toast.id)

      return id
    },
    [resolve, syncKeys],
  )

  const undo = useCallback((id) => resolve(id, { cancel: true }), [resolve])

  useEffect(() => {
    const flush = () => {
      if (pending.current.size === 0) return

      setUnloading()
      for (const id of [...pending.current.keys()]) resolve(id)
    }

    window.addEventListener('pagehide', flush)

    return () => window.removeEventListener('pagehide', flush)
  }, [resolve])

  const value = useMemo(
    () => ({ push, dismiss: resolve, undo, pendingKeys }),
    [push, resolve, undo, pendingKeys],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastStack toasts={toasts} onDismiss={resolve} onUndo={undo} />
    </ToastContext.Provider>
  )
}

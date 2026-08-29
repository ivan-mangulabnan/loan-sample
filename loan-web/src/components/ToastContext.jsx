import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import ToastStack from './ToastStack.jsx'
import { ToastContext } from './ToastContextValue.js'
import { setUnloading } from '../lib/apiClient.js'

const MAX_VISIBLE = 3

const NO_KEYS = new Set()

// Matches --motion-out in tokens.css.
const EXIT_MS = 180

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [pendingKeys, setPendingKeys] = useState(NO_KEYS)

  // Set while the whole stack is being retired at once — signing out. Individual
  // dismissals animate inside Toast; this covers the case where the provider drops
  // every toast in one go and there is no per-toast timer to hang the exit on.
  const [isLeavingAll, setIsLeavingAll] = useState(false)

  // A <dialog> opened with showModal() renders in the browser's top layer, above
  // every z-index — a fixed-position stack outside it is painted underneath and the
  // reader sees nothing. An open Modal claims this slot so a toast raised while it is
  // open can portal into the dialog and sit above it; it releases the slot on close.
  const [portalHost, setPortalHost] = useState(null)

  // Read by push() without re-creating it on every host change — push is in the
  // context value, and a new identity there re-renders every consumer.
  const hostRef = useRef(null)
  hostRef.current = portalHost

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

      // Returned so flushPending can await the write; the timer path ignores it.
      if (!cancel) return entry.commit()
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
        {
          id,
          message,
          tone,
          duration,
          undoLabel,
          undoable: Boolean(commit),
          // Pinned at push time. A toast must never migrate between the two stacks:
          // changing its container remounts it, which replays its entry animation
          // and restarts its dismiss timer.
          //
          // An undoable one is always page-level, never pinned to a dialog. It is
          // raised by useWriteAction.run() from a modal that is closing, but
          // setTarget(null) is a state update and has not flushed yet, so hostRef
          // still points at the live <dialog> — pinning it there meant the orphan
          // sweep retired it the instant the modal unmounted, force-committing the
          // write and taking the undo window with it. Outliving the modal is the
          // entire point of this toast.
          host: commit ? null : hostRef.current,
        },
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

  // Commits every deferred write and waits for it — for teardown *inside* the app,
  // where the page is not going anywhere and the requests can be awaited normally.
  //
  // `pagehide` above cannot do this job: it does not fire on a client-side route
  // change, so signing out after a decision used to drop the write entirely (the
  // undo window was still open, the cookie was already gone). It also sets
  // `keepalive`, which is right for a real unload and wrong here — we want to know
  // the write landed before the session ends.
  const flushPending = useCallback(async () => {
    if (pending.current.size === 0) return

    // Start the exit, and start the writes at the same moment — the animation is
    // not allowed to delay the network. Without this the row of toasts was simply
    // cut away as the route swapped, which read as a snap rather than a dismissal.
    setIsLeavingAll(true)

    const commits = Promise.allSettled(
      [...pending.current.entries()].map(([id, entry]) => {
        pending.current.delete(id)
        return entry.commit()
      }),
    )

    await Promise.all([commits, new Promise((done) => setTimeout(done, EXIT_MS))])

    syncKeys()
    visible.current = []
    setToasts(visible.current)
    setIsLeavingAll(false)
  }, [syncKeys])

  // A toast pinned to a dialog stops rendering the moment that dialog closes, but it
  // is still in the list — left there it would occupy a MAX_VISIBLE slot forever and
  // never run its own dismiss. Retire it here instead.
  useEffect(() => {
    const orphaned = visible.current.filter(
      (toast) => toast.host && toast.host !== portalHost,
    )

    for (const toast of orphaned) resolve(toast.id)
  }, [portalHost, resolve])

  const value = useMemo(
    () => ({ push, dismiss: resolve, undo, flushPending, pendingKeys, setPortalHost }),
    [push, resolve, undo, flushPending, pendingKeys],
  )

  // isConnected guards the gap between a host unmounting and its cleanup landing:
  // portalling into a detached node throws and takes the whole tree with it.
  const host = portalHost?.isConnected ? portalHost : null

  // Two stacks, each mounted in one place for its lifetime. Route strictly on the
  // host a toast was pinned to: one raised inside a dialog belongs to that dialog and
  // is DROPPED when it closes, never re-homed into the page stack. Re-homing is a
  // remount — it replays toast-in and restarts the dismiss timer, which reads as the
  // toast firing a second time on close.
  const inPage = toasts.filter((toast) => !toast.host)
  const inHost = host ? toasts.filter((toast) => toast.host === host) : []

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastStack
        toasts={inPage}
        onDismiss={resolve}
        onUndo={undo}
        isLeavingAll={isLeavingAll}
      />
      {host &&
        createPortal(
          <ToastStack
            toasts={inHost}
            onDismiss={resolve}
            onUndo={undo}
            isLeavingAll={isLeavingAll}
          />,
          host,
        )}
    </ToastContext.Provider>
  )
}

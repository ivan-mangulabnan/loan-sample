import { useContext } from 'react'
import { ToastContext } from './ToastContextValue.js'

/**
 * Raise a toast: `useToast().push({ message })`.
 *
 * Throws outside a provider rather than returning a no-op. A silently swallowed
 * confirmation is the failure mode that survives to production — the reader is told
 * nothing happened when it did.
 */
export function useToast() {
  const context = useContext(ToastContext)

  if (!context) throw new Error('useToast must be used within a <ToastProvider>.')

  return context
}

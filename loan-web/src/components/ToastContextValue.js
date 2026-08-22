import { createContext } from 'react'

/**
 * Split from the provider so that file exports only a component and fast refresh keeps
 * working — the same reason `features/auth` keeps `SessionContextValue.js` beside
 * `SessionContext.jsx`. Read it through `useToast`, not directly.
 */
export const ToastContext = createContext(null)

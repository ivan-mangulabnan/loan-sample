import { useContext } from 'react'
import { SessionContext } from './SessionContextValue.js'

export function useSession() {
  const session = useContext(SessionContext)

  if (!session)
    throw new Error('useSession must be used inside a <SessionProvider>.')

  return session
}

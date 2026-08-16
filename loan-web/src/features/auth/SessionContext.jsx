import { useCallback, useMemo, useState } from 'react'
import { getToken, readClaims, setToken } from '../../lib/token.js'
import * as authApi from './api.js'
import { SessionContext } from './SessionContextValue.js'

export function SessionProvider({ children }) {
  const [claims, setClaims] = useState(() => readClaims(getToken()))

  const signIn = useCallback(async (credentials) => {
    const { token } = await authApi.login(credentials)
    setToken(token)

    const next = readClaims(token)
    if (!next) throw new Error('The server returned a token we could not read.')

    setClaims(next)
    return next
  }, [])

  const signOut = useCallback(() => {
    setToken(null)
    setClaims(null)
  }, [])

  const value = useMemo(
    () => ({
      claims,
      role: claims?.role ?? null,
      isAuthenticated: Boolean(claims),
      signIn,
      signOut,
    }),
    [claims, signIn, signOut],
  )

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}

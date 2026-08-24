import { useCallback, useEffect, useMemo, useState } from 'react'
import { setUnauthorizedHandler } from '../../lib/apiClient.js'
import * as authApi from './api.js'
import { SessionContext } from './SessionContextValue.js'

export function SessionProvider({ children }) {
  const [identity, setIdentity] = useState(null)

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    authApi
      .me()
      .then((next) => {
        if (!cancelled) setIdentity(next)
      })
      .catch(() => {
        if (!cancelled) setIdentity(null)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => setIdentity(null))
    return () => setUnauthorizedHandler(null)
  }, [])

  const signIn = useCallback(async (credentials) => {
    const next = await authApi.login(credentials)
    setIdentity(next)
    return next
  }, [])

  const signOut = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setIdentity(null)
    }
  }, [])

  const value = useMemo(
    () => ({
      identity,
      role: identity?.role ?? null,
      name: identity?.name ?? null,
      firstName: identity?.firstName ?? null,
      middleName: identity?.middleName ?? null,
      lastName: identity?.lastName ?? null,
      isAuthenticated: Boolean(identity),
      isLoading,
      signIn,
      signOut,
    }),
    [identity, isLoading, signIn, signOut],
  )

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { setUnauthorizedHandler } from '../../lib/apiClient.js'
import * as authApi from './api.js'
import { SessionContext } from './SessionContextValue.js'

export function SessionProvider({ children }) {
  const [identity, setIdentity] = useState(null)

  // The token lives in an HttpOnly cookie, so "am I signed in?" is a question only
  // the server can answer. Nothing that depends on the answer may render until it
  // comes back — see RequireRole.
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    authApi
      .me()
      .then((next) => {
        if (!cancelled) setIdentity(next)
      })
      .catch(() => {
        if (!cancelled) setIdentity(null) // 401 — simply not signed in
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // There is no refresh token, so the session ends the moment the JWT expires.
  // Clearing identity is enough — RequireRole redirects on the next render and
  // preserves the current path for the return trip.
  useEffect(() => {
    setUnauthorizedHandler(() => setIdentity(null))
    return () => setUnauthorizedHandler(null)
  }, [])

  const signIn = useCallback(async (credentials) => {
    // Login returns the same shape as /Auth/me, so there is one path from
    // response to session state.
    const next = await authApi.login(credentials)
    setIdentity(next)
    return next
  }, [])

  const signOut = useCallback(async () => {
    // Only the server can clear an HttpOnly cookie. Skipping this would leave a
    // working credential behind and silently sign the user back in on reload.
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
      // The parts behind `name`. Null exactly when the user has no Account — the case
      // where `name` is the login handle rather than a person's name, which is why the
      // greeting reads these instead of splitting that string.
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

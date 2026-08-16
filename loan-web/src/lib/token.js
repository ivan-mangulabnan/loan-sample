const STORAGE_KEY = 'loan-web.token'

let current = localStorage.getItem(STORAGE_KEY)

export function getToken() {
  return current
}

export function setToken(token) {
  current = token
  if (token) localStorage.setItem(STORAGE_KEY, token)
  else localStorage.removeItem(STORAGE_KEY)
}

/**
 * Reads the payload of a JWT without verifying it. The signature is the
 * server's business — we only need the claims to decide what to render.
 * Never trust this for authorisation; every endpoint re-checks the role.
 */
export function decodeToken(token) {
  if (!token) return null

  try {
    const segment = token.split('.')[1]
    const bytes = Uint8Array.from(
      atob(segment.replace(/-/g, '+').replace(/_/g, '/')),
      (char) => char.charCodeAt(0),
    )
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return null
  }
}

// The backend emits the long-form .NET claim URIs.
const ROLE_CLAIM =
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
const NAME_ID_CLAIM =
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'

export function readClaims(token) {
  const payload = decodeToken(token)
  if (!payload) return null

  const expiresAt = payload.exp ? payload.exp * 1000 : null
  if (expiresAt && expiresAt <= Date.now()) return null

  return {
    userId: payload[NAME_ID_CLAIM] ?? payload.nameid ?? null,
    role: payload[ROLE_CLAIM] ?? payload.role ?? null,
    tenantId: payload.tenantId ?? null,
    expiresAt,
  }
}

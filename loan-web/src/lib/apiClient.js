const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

// The session dies without warning when the JWT expires — there is no refresh token.
// Handled in one place because feature hooks render errors inline, so a 401 would
// otherwise show "Unauthorized" inside a page the user can no longer use.
let onUnauthorized = null

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  // The API authenticates with an HttpOnly cookie the browser sets at login. There is
  // no token to attach here — script cannot read it, which is the point.
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    // 'include' rather than 'same-origin': identical behind the dev proxy, but if
    // VITE_API_BASE_URL is ever an absolute URL, 'same-origin' drops the cookie
    // silently while 'include' fails loudly with a named CORS error.
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
    signal,
  })

  const text = await response.text()

  // Not every error body is JSON: BadRequest(ex.Message) sends bare text, and an
  // unhandled 500 or a dead proxy sends HTML. Parsing blind turns those into a
  // SyntaxError that escapes as-is, so the caller sees a parser message instead
  // of an ApiError it can branch on.
  let payload = null
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      if (response.ok) throw new ApiError('Malformed JSON in response.', response.status, text)
      payload = text
    }
  }

  if (!response.ok) {
    // /Auth/ paths are excluded: the bootstrap /Auth/me 401 is the normal
    // signed-out signal, and /Auth/login's 401 is a bad-password message the
    // login page renders itself. Case-insensitive so a lowercase path cannot
    // slip past and trigger a redirect loop.
    if (response.status === 401 && !path.toLowerCase().startsWith('/auth/'))
      onUnauthorized?.()

    throw new ApiError(
      (typeof payload === 'string' ? payload : payload?.message) ??
        response.statusText,
      response.status,
      payload,
    )
  }

  return payload
}

export const apiClient = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  del: (path, options) => request(path, { ...options, method: 'DELETE' }),
}

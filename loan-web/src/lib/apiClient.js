const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

let onUnauthorized = null

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

let isUnloading = false

export function setUnloading() {
  isUnloading = true
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
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
    keepalive: isUnloading || undefined,
    signal,
  })

  const text = await response.text()

  let payload = null
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      if (response.ok)
        throw new ApiError('The server sent something unexpected.', response.status, text)
      payload = text
    }
  }

  if (!response.ok) {
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

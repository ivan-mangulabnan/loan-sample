import { apiClient } from '../../lib/apiClient.js'

export function login({ tenantId, userName, password }) {
  return apiClient.post('/Auth/login', { tenantId, userName, password })
}

export function register(payload) {
  return apiClient.post('/Auth/register', payload)
}

// The cookie is unreadable to script, so identity comes from the server.
export function me() {
  return apiClient.get('/Auth/me')
}

// Clears the HttpOnly cookie — the client cannot do this itself.
export function logout() {
  return apiClient.post('/Auth/logout')
}

import { apiClient } from '../../lib/apiClient.js'

export function login({ tenantId, userName, password }) {
  return apiClient.post('/Auth/login', { tenantId, userName, password })
}

export function register(payload) {
  return apiClient.post('/Auth/register', payload)
}

export function me() {
  return apiClient.get('/Auth/me')
}

export function logout() {
  return apiClient.post('/Auth/logout')
}

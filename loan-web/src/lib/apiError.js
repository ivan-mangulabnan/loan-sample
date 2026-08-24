const HTTP_STATUS_TEXT = new Set([
  'Bad Request',
  'Unauthorized',
  'Forbidden',
  'Not Found',
  'Method Not Allowed',
  'Conflict',
  'Unprocessable Entity',
  'Too Many Requests',
  'Internal Server Error',
  'Not Implemented',
  'Bad Gateway',
  'Service Unavailable',
  'Gateway Timeout',
])

function isUseful(text) {
  const trimmed = text?.trim()
  if (!trimmed) return false
  if (HTTP_STATUS_TEXT.has(trimmed)) return false

  return !trimmed.startsWith('<')
}

export function messageFrom(error, fallback = 'Something went wrong.') {
  const validation = error?.body?.errors
  if (validation) {
    const first = Object.values(validation).flat()[0]
    if (first) return first
  }

  if (typeof error?.body === 'string' && isUseful(error.body)) return error.body

  return isUseful(error?.message) ? error.message : fallback
}

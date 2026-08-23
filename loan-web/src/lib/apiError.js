/**
 * Turns an ApiError into a sentence worth showing a user.
 *
 * The API rejects a bad request three different ways and only one of them matches the
 * { message } shape apiClient reads, so `error.message` alone says "Bad Request" or
 * "Conflict" and tells the reader nothing.
 *
 * Resolution order, most specific first:
 *
 * 1. **ProblemDetails** — model validation returns { errors: { Field: [msg, ...] } }.
 *    The first message is the one to show; listing all of them repeats "is required"
 *    once per field.
 * 2. **A bare string body** — every service throws InvalidOperationException for a
 *    business-rule violation and every controller answers Conflict(ex.Message), so a
 *    409 carries plain text rather than JSON. This is the common case for the write
 *    endpoints: "Cannot review an application with status 'PENDING_APPROVAL'." reads
 *    better than anything the client could compose, because only the server knows
 *    which rule was broken.
 * 3. `error.message` — a { message } body.
 * 4. The caller's fallback.
 *
 * Callers that can say something more useful about a specific status should branch on
 * `error.status` themselves and call this for everything else.
 */

/**
 * Text that came from the transport rather than from the application, and means nothing
 * to the person reading it.
 *
 * Two ways it used to reach the screen. apiClient falls back to `response.statusText`
 * when an error carries no body, which renders the literal words "Bad Request" or
 * "Internal Server Error"; and a 500 or a dead proxy answers with an HTML page, which
 * arrives as a string body and was passed straight through as though it were a sentence
 * a service had written. Neither tells the reader anything, so both defer to the
 * caller's fallback, which at least names the action that failed.
 */
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

  // An HTML error page, not prose. Cheap sniff rather than a parse: the only thing that
  // matters is that it is not shown.
  return !trimmed.startsWith('<')
}

export function messageFrom(error, fallback = 'Something went wrong.') {
  const validation = error?.body?.errors
  if (validation) {
    const first = Object.values(validation).flat()[0]
    if (first) return first
  }

  // Kept, and deliberately: a 409's plain sentence is written by the only layer that
  // knows which business rule was broken, and is better than anything composed here.
  if (typeof error?.body === 'string' && isUseful(error.body)) return error.body

  return isUseful(error?.message) ? error.message : fallback
}

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
 * 3. `error.message` — a { message } body, or the HTTP status text.
 * 4. The caller's fallback.
 *
 * Callers that can say something more useful about a specific status should branch on
 * `error.status` themselves and call this for everything else.
 */
export function messageFrom(error, fallback = 'Something went wrong.') {
  const validation = error?.body?.errors
  if (validation) {
    const first = Object.values(validation).flat()[0]
    if (first) return first
  }

  if (typeof error?.body === 'string' && error.body) return error.body

  return error?.message ?? fallback
}

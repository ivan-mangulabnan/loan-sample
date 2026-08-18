/**
 * Appends a query string to a path, dropping anything the caller left unset.
 *
 * Required for correctness, not tidiness. `apiClient` concatenates `path` verbatim, and
 * the values threaded through here include user-typed search text — an `&`, a `#`, a `+`
 * or a space would otherwise be read as URL syntax and either truncate the term or
 * smuggle a second parameter into the request. URLSearchParams encodes all of it.
 *
 * null, undefined and '' are dropped rather than sent: the API reads a missing parameter
 * as "do not filter", while `status=` is a present-but-empty value that a stricter binder
 * could reject. `0` and `false` are kept — they are values, not absences.
 */
export function withQuery(path, params) {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === null || value === undefined || value === '') continue
    search.set(key, String(value))
  }

  const query = search.toString()

  return query ? `${path}?${query}` : path
}

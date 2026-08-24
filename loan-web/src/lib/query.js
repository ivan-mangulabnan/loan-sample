export function withQuery(path, params) {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === null || value === undefined || value === '') continue
    search.set(key, String(value))
  }

  const query = search.toString()

  return query ? `${path}?${query}` : path
}

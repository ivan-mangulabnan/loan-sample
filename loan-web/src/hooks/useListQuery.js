import { useCallback, useState } from 'react'

/**
 * The `{ page, search, status }` triple every list page threads into its data hook and
 * down into `ListView`. Six pages hold exactly this state, which is what earns it a
 * place here (rule 3) rather than a copy each.
 *
 * Two of the three reach the server. `page` never does — it selects a slice of rows
 * already in memory, so changing it costs a render and no request. That is the whole
 * reason the data hooks take `{ search, status }` and not this object.
 *
 * `onQueryChange` takes a partial and is stable across renders — ListView debounces the
 * search box against it, and a fresh identity every render would re-arm that timer
 * instead of letting it fire. ListView is also what decides *which* changes reset the
 * page, so this merges the patch and nothing more.
 */
export function useListQuery(initial) {
  const [query, setQuery] = useState({ page: 1, search: '', status: '', ...initial })

  const onQueryChange = useCallback(
    (patch) => setQuery((current) => ({ ...current, ...patch })),
    [],
  )

  return [query, onQueryChange]
}

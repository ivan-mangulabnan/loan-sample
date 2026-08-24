import { useCallback, useState } from 'react'

export function useListQuery(initial) {
  const [query, setQuery] = useState({ page: 1, search: '', status: '', ...initial })

  const onQueryChange = useCallback(
    (patch) => setQuery((current) => ({ ...current, ...patch })),
    [],
  )

  return [query, onQueryChange]
}

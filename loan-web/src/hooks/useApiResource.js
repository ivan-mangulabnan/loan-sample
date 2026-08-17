import { useCallback, useEffect, useState } from 'react'

/**
 * Generic loading/error/data wrapper around an apiClient call.
 * Feature hooks.js files build on this instead of hand-rolling useEffect.
 */
export function useApiResource(fetcher, deps = []) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reloadToken, setReloadToken] = useState(0)

  const reload = useCallback(() => setReloadToken((n) => n + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    setIsLoading(true)

    fetcher({ signal: controller.signal })
      .then((result) => {
        setData(result)
        setError(null)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err)
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadToken])

  return { data, error, isLoading, reload }
}

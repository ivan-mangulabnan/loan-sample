import { useCallback, useState } from 'react'
import { useToast } from '../components/useToast.js'
import { messageFrom } from '../lib/apiError.js'

export function useWriteAction(submit, onDone) {
  const toast = useToast()

  const [target, setTarget] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const open = useCallback((row) => {
    setError(null)
    setTarget(row)
  }, [])

  const close = useCallback(() => {
    if (isSubmitting) return

    setTarget(null)
    setError(null)
  }, [isSubmitting])

  const run = useCallback(
    async (payload) => {
      setIsSubmitting(true)
      setError(null)

      try {
        const result = await submit(target, payload)

        setTarget(null)
        toast.push({ message: result?.message ?? 'Done.' })
        onDone?.()
      } catch (err) {
        setError(messageFrom(err, 'The action could not be completed.'))
      } finally {
        setIsSubmitting(false)
      }
    },
    [submit, target, onDone, toast],
  )

  return { target, open, close, isSubmitting, error, run }
}

import { useCallback, useState } from 'react'
import { useToast } from '../components/useToast.js'
import { messageFrom } from '../lib/apiError.js'

const UNDO_MS = 7000

export function useWriteAction(submit, onDone, { deferMessage = null, keyOf = null } = {}) {
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
      if (deferMessage) {
        const row = target
        const message = deferMessage(row, payload)

        setTarget(null)

        toast.push({
          message,
          key: keyOf?.(row),
          undoLabel: `Undo — ${message}`,
          duration: UNDO_MS,
          commit: async () => {
            try {
              await submit(row, payload)
            } catch (err) {
              toast.push({
                message: messageFrom(err, 'The action could not be completed.'),
                tone: 'danger',
              })
            } finally {
              onDone?.()
            }
          },
        })

        return
      }

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
    [submit, target, onDone, toast, deferMessage, keyOf],
  )

  return { target, open, close, isSubmitting, error, run }
}

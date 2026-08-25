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
      // Deferred mode: hold the request behind an undo toast instead of sending
      // it. Nothing is awaited here, so there is no submitting state and the
      // modal's inline error has nothing to show — a failure arrives later, as
      // a toast, because by then the modal is long closed.
      if (deferMessage) {
        // Captured now. `target` is cleared on the next line, so reading it at
        // commit time would find nothing.
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
              // Either way the queue is refetched: on success to settle the
              // optimistic removal, on failure to put the row back.
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

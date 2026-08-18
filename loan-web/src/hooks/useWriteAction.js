import { useCallback, useState } from 'react'
import { messageFrom } from '../lib/apiError.js'

/**
 * The state behind a "click a row, act in a dialog" write. The three staff queues all
 * need the same four pieces and the same success/failure policy, so it lives here rather
 * than three times over (rule 3).
 *
 * `submit(target, payload)` performs the request and resolves to the API's
 * MessageResponse. `onDone` is called after a success — the queues pass `reload`, since
 * an acted-on row has left the stage the endpoint is pinned to and should disappear.
 *
 * The policy worth stating:
 *
 * - **Success closes the dialog** and keeps the server's own sentence as the notice.
 *   "Review recorded." comes from the endpoint that did the work, so it cannot drift
 *   out of step with what actually happened the way a hardcoded string can.
 * - **Failure leaves it open**, with the message beside the input that caused it.
 *   Closing on error would throw away typed remarks and leave the reader guessing.
 * - **Closing mid-flight is refused.** The request is already gone; letting the dialog
 *   shut would show a stale queue with no word of how it ended.
 */
export function useWriteAction(submit, onDone) {
  const [target, setTarget] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  const open = useCallback((row) => {
    setError(null)
    setNotice(null)
    setTarget(row)
  }, [])

  const close = useCallback(() => {
    if (isSubmitting) return

    setTarget(null)
    setError(null)
  }, [isSubmitting])

  const dismissNotice = useCallback(() => setNotice(null), [])

  const run = useCallback(
    async (payload) => {
      setIsSubmitting(true)
      setError(null)

      try {
        const result = await submit(target, payload)

        setTarget(null)
        setNotice(result?.message ?? 'Done.')
        onDone?.()
      } catch (err) {
        setError(messageFrom(err, 'The action could not be completed.'))
      } finally {
        setIsSubmitting(false)
      }
    },
    [submit, target, onDone],
  )

  return { target, open, close, isSubmitting, error, notice, dismissNotice, run }
}

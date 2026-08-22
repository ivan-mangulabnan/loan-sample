import { useCallback, useState } from 'react'
import { useToast } from '../components/useToast.js'
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
 * - **Success closes the dialog** and raises the server's own sentence as a toast.
 *   "Review recorded." comes from the endpoint that did the work, so it cannot drift
 *   out of step with what actually happened the way a hardcoded string can.
 * - **Failure leaves it open**, with the message beside the input that caused it.
 *   Closing on error would throw away typed remarks and leave the reader guessing.
 *   This is why the error is *not* a toast: it belongs next to the field it is about,
 *   and it must not expire while the form is still on screen waiting to be corrected.
 * - **Closing mid-flight is refused.** The request is already gone; letting the dialog
 *   shut would show a stale queue with no word of how it ended.
 *
 * The success message used to render inline, between the page heading and the list.
 * That cost the list real height — `.callout` will not shrink and `.list` takes what is
 * left — so the table lost rows the instant a write landed, reflowing under the reader's
 * cursor. A toast is out of flow, so the list keeps every pixel it had.
 */
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

        // Cleared before the toast is raised, so the dialog is already gone by the time
        // the notice exists. A <dialog> opened with showModal() sits in the browser's
        // top layer, above every z-index, and a toast could not be seen over it.
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

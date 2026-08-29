import { useEffect, useRef, useState } from 'react'
import { useToast } from './useToast.js'
import './Modal.css'

// Matches --motion-out in tokens.css.
const EXIT_MS = 180

function Modal({ open, title, onClose, children, footer }) {
  const ref = useRef(null)

  const { setPortalHost } = useToast()

  // Held in state, not read off the ref: the toast layer has to re-render once the
  // node exists, and a ref assignment does not trigger that.
  const [host, setHost] = useState(null)

  // Kept mounted for the length of the exit. `open` going false used to unmount the
  // dialog in the same commit, so it vanished with no animation — there was nothing
  // left on screen to animate.
  const [isPresent, setIsPresent] = useState(open)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    if (open) {
      setIsPresent(true)
      setIsLeaving(false)
      return
    }

    if (!isPresent) return

    setIsLeaving(true)
    const timer = setTimeout(() => {
      setIsPresent(false)
      setIsLeaving(false)
    }, EXIT_MS)

    return () => clearTimeout(timer)
  }, [open, isPresent])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return

    // close() only once the exit has played — closing immediately would drop the
    // dialog out of the top layer and hide it before the animation could run.
    if (isPresent && !isLeaving && !dialog.open) dialog.showModal()
    if (!isPresent && dialog.open) dialog.close()
  }, [isPresent, isLeaving])

  // Lend the dialog to the toast stack while it is open so a toast raised from
  // inside the modal paints above it rather than behind the top layer. Released as
  // soon as it starts leaving, not when it finally unmounts, so the orphan sweep
  // still retires a validation toast on time.
  useEffect(() => {
    if (!open || isLeaving || !host) return

    setPortalHost(host)
    return () => setPortalHost(null)
  }, [open, isLeaving, host, setPortalHost])

  if (!isPresent) return null

  return (
    <dialog
      ref={(node) => {
        ref.current = node
        setHost(node)
      }}
      className={`modal${isLeaving ? ' modal--leaving' : ''}`}
      // Esc fires the native close event. Ignored once we are already leaving,
      // because our own dialog.close() at the end of the exit fires it too — and
      // that would call onClose a second time, closing whatever opened next.
      onClose={() => {
        if (!isLeaving) onClose()
      }}
      onClick={(event) => {
        if (!isLeaving && event.target === ref.current) onClose()
      }}
    >
      <div className="modal__panel">
        <header className="modal__head">
          <h2 className="modal__title">{title}</h2>
          <button
            type="button"
            className="modal__close"
            aria-label="Close"
            disabled={isLeaving}
            onClick={onClose}
          >
            ✕
          </button>
        </header>

        <div className="modal__body">{children}</div>

        {footer && <footer className="modal__foot">{footer}</footer>}
      </div>
    </dialog>
  )
}

export default Modal

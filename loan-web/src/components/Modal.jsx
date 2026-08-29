import { useEffect, useRef, useState } from 'react'
import { useToast } from './useToast.js'
import './Modal.css'

function Modal({ open, title, onClose, children, footer }) {
  const ref = useRef(null)

  const { setPortalHost } = useToast()

  // Held in state, not read off the ref: the toast layer has to re-render once the
  // node exists, and a ref assignment does not trigger that.
  const [host, setHost] = useState(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return

    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  // Lend the dialog to the toast stack while it is open so a toast raised from
  // inside the modal paints above it rather than behind the top layer.
  useEffect(() => {
    if (!open || !host) return

    setPortalHost(host)
    return () => setPortalHost(null)
  }, [open, host, setPortalHost])

  if (!open) return null

  return (
    <dialog
      ref={(node) => {
        ref.current = node
        setHost(node)
      }}
      className="modal"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose()
      }}
    >
      <div className="modal__panel">
        <header className="modal__head">
          <h2 className="modal__title">{title}</h2>
          <button
            type="button"
            className="modal__close"
            aria-label="Close"
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

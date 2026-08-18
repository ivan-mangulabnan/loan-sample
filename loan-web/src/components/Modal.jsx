import { useEffect, useRef } from 'react'
import './Modal.css'

/**
 * A dialog over the page, built on the native <dialog> element.
 *
 * showModal() is doing real work here, not just showing a box: it puts the element in
 * the browser's top layer (so no z-index on an ancestor can bury it), paints a
 * ::backdrop, moves focus inside, keeps Tab from leaving, and closes on Escape. Every
 * one of those is a hand-rolled bug otherwise, and the focus trap is the one nobody
 * gets right.
 *
 * `open` stays the source of truth. The element can also close itself — Escape, or the
 * form's dialog method — so the `close` event is wired back to `onClose` rather than
 * only the ✕ button. Without that the DOM would be shut while React still believed the
 * modal was open, and reopening the same row would do nothing.
 */
function Modal({ open, title, onClose, children, footer }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return

    // showModal() on an already-open dialog throws, and close() on a closed one is a
    // no-op that still fires nothing — so both are guarded by the element's own state
    // rather than by tracking the previous prop.
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  // Not rendered at all when closed: a <dialog> without `open` is display:none, but its
  // children would still mount, and a remarks box that survives a cancel would hand the
  // next row the last one's text.
  if (!open) return null

  return (
    <dialog
      ref={ref}
      className="modal"
      onClose={onClose}
      // The backdrop is painted by the dialog itself, so a click on it lands on the
      // element rather than on any child. Anything inside the content bubbles up with a
      // deeper target, which is what separates the two.
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

import Toast from './Toast.jsx'
import './ToastStack.css'

/**
 * Where toasts appear. Fixed, so it sits outside the layout entirely — which is the
 * whole point: the inline notice this replaces was a flex child of `.main`, and every
 * pixel it took came out of the list below it, resizing the table at the moment the
 * reader had just acted on a row.
 *
 * The container is always mounted, even with nothing in it. A live region inserted into
 * the DOM at the same moment as its first message is commonly not announced at all;
 * an empty one that is already present is.
 */
function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="toaststack" role="status" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          tone={toast.tone}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
    </div>
  )
}

export default ToastStack

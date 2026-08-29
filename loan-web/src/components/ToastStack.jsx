import Toast from './Toast.jsx'
import './ToastStack.css'

function ToastStack({ toasts, onDismiss, onUndo, isLeavingAll = false }) {
  return (
    <div className="toaststack" role="status" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          tone={toast.tone}
          duration={toast.duration}
          undoLabel={toast.undoLabel}
          // Forced out together when the session ends, rather than each waiting on
          // its own timer that is about to be unmounted anyway.
          leaving={isLeavingAll}
          onDismiss={() => onDismiss(toast.id)}
          onUndo={toast.undoable ? () => onUndo(toast.id) : null}
        />
      ))}
    </div>
  )
}

export default ToastStack

import Toast from './Toast.jsx'
import './ToastStack.css'

function ToastStack({ toasts, onDismiss, onUndo }) {
  return (
    <div className="toaststack" role="status" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          tone={toast.tone}
          duration={toast.duration}
          undoLabel={toast.undoLabel}
          onDismiss={() => onDismiss(toast.id)}
          onUndo={toast.undoable ? () => onUndo(toast.id) : null}
        />
      ))}
    </div>
  )
}

export default ToastStack

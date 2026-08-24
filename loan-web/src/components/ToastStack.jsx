import Toast from './Toast.jsx'
import './ToastStack.css'

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

import Button from './Button.jsx'
import Glow, { GlowHost } from './Glow.jsx'
import './Callout.css'

function Callout({ children, action, onAction, onDismiss }) {
  return (
    <GlowHost className="callout">
      <Glow tone="accent" placement="top-left" />
      <Glow tone="info" placement="top-right" />

      <p className="callout__text">{children}</p>

      {action && <Button onClick={onAction}>{action}</Button>}

      {onDismiss && (
        <button
          type="button"
          className="callout__dismiss"
          aria-label="Dismiss"
          onClick={onDismiss}
        >
          ✕
        </button>
      )}
    </GlowHost>
  )
}

export default Callout

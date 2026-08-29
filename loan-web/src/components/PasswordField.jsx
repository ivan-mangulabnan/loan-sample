import { useState } from 'react'
import './PasswordField.css'

// Inline SVG rather than a font glyph, for the reason issue #9 settled: the symbol
// codepoints render as tofu outside Chromium's bundled font. Same 16-box, stroke and
// weight as the sign-out icon in AppLayout.
function EyeIcon({ off }) {
  return (
    <svg
      className="pwfield__icon"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1.5 8s2.4-4 6.5-4 6.5 4 6.5 4-2.4 4-6.5 4S1.5 8 1.5 8Z" />
      <circle cx="8" cy="8" r="1.9" />
      {off && <path d="M2.5 13.5 13.5 2.5" />}
    </svg>
  )
}

/**
 * A password input with a show/hide toggle (issue #18).
 *
 * Wraps the control rather than replacing it: the caller still owns the id, value
 * and handlers, and the input keeps `field field--input` so it stays consistent with
 * every other control and picks up `.field--invalid` when validation marks it.
 */
function PasswordField({ className = '', ...rest }) {
  const [revealed, setRevealed] = useState(false)

  return (
    <span className="pwfield">
      <input
        {...rest}
        type={revealed ? 'text' : 'password'}
        className={`field field--input pwfield__input ${className}`.trim()}
      />
      {/* Deliberately in the tab order. A keyboard-only user has no other way to
          reach it, and they are the ones most likely to want to check what they
          typed — taking it out would leave the feature to mouse users only. */}
      <button
        type="button"
        className="pwfield__toggle"
        aria-pressed={revealed}
        aria-label={revealed ? 'Hide password' : 'Show password'}
        title={revealed ? 'Hide password' : 'Show password'}
        onClick={() => setRevealed((prev) => !prev)}
      >
        <EyeIcon off={revealed} />
      </button>
    </span>
  )
}

export default PasswordField

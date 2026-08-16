import { useEffect, useRef, useState } from 'react'
import Glow from '../../../components/Glow.jsx'
import './AuthScreen.css'

/**
 * Full-viewport frame shared by sign in and sign up. Owns the shell surface so
 * these pages match the dashboard instead of sitting on the near-black page
 * colour, and owns the height rules so neither page scrolls the document.
 *
 * Every auth card is the same width — do not add a per-page override.
 *
 * transitionKey: change it to cross-fade the body (e.g. a wizard step). The
 *   card animates its height between the old and new content.
 * footer: stable content below the body — it sits outside the animated pane so
 *   it does not re-fade on every step change.
 */
function AuthScreen({ title, subtitle, header, footer, transitionKey, children }) {
  const bodyRef = useRef(null)
  const [height, setHeight] = useState(null)

  // Measure the body and pin the height so the card can animate between sizes;
  // 'auto' is not an animatable value. ResizeObserver rather than a one-shot
  // read because the body also grows when an error message appears.
  //
  // Re-runs on transitionKey: the measured node is the keyed one, so React
  // swaps it on a step change and an observer bound to the old node would keep
  // reporting the previous step's height.
  useEffect(() => {
    const node = bodyRef.current
    if (!node) return

    const observer = new ResizeObserver(([entry]) => {
      // borderBoxSize, not contentRect: the pane pads its own bottom for the
      // focus ring, and contentRect would exclude that and clip it again.
      const box = entry.borderBoxSize?.[0]
      setHeight(box ? box.blockSize : entry.target.offsetHeight)
    })
    observer.observe(node)

    return () => observer.disconnect()
  }, [transitionKey])

  return (
    <div className="auth glow-host">
      {/* On the frame, not the card: the glow reads as ambient light in the
          room rather than a ring around a floating box. Scaled up via the
          documented size/blur props — the default placements are tuned for a
          card and would land off-screen at viewport size. */}
      <Glow tone="accent" placement="top-left" size="620px" blur="130px" />
      <Glow tone="info" placement="bottom-right" size="520px" blur="120px" />

      <div className="auth__scroll">
        <div className="auth__card">
          <h1 className="heading">{title}</h1>
          {subtitle && <p className="muted">{subtitle}</p>}
          {header}

          <div
            className="auth__body"
            style={height === null ? undefined : { height }}
          >
            {/* Keyed so React swaps the subtree, which restarts the fade. */}
            <div ref={bodyRef} key={transitionKey} className="auth__pane">
              {children}
            </div>
          </div>

          {footer}
        </div>
      </div>
    </div>
  )
}

export default AuthScreen

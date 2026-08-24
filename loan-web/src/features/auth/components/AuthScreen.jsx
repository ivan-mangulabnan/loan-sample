import { useEffect, useRef, useState } from 'react'
import Glow from '../../../components/Glow.jsx'
import './AuthScreen.css'

function AuthScreen({ title, subtitle, header, footer, transitionKey, children }) {
  const bodyRef = useRef(null)
  const [height, setHeight] = useState(null)

  useEffect(() => {
    const node = bodyRef.current
    if (!node) return

    const observer = new ResizeObserver(([entry]) => {
      const box = entry.borderBoxSize?.[0]
      setHeight(box ? box.blockSize : entry.target.offsetHeight)
    })
    observer.observe(node)

    return () => observer.disconnect()
  }, [transitionKey])

  return (
    <div className="auth glow-host">
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

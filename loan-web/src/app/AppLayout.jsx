import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useToast } from '../components/useToast.js'
import { useSession } from '../features/auth/index.js'
import { configFor } from '../features/dashboard/index.js'
import './AppLayout.css'

function AppLayout() {
  const { role, signOut } = useSession()
  const { flushPending } = useToast()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const navItems = configFor(role)?.nav ?? []

  async function handleSignOut() {
    // A decision taken in the last few seconds is still sitting in its undo window,
    // uncommitted. Send it before the cookie goes, or the write is lost — signing
    // out is a decision to leave, not a decision to undo (issue #17).
    await flushPending()
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app">
      <div className="shell">
        <nav className="rail">
          <div className="rail__items">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className="rail__item"
                title={item.label}
                aria-label={item.label}
              >
                {item.glyph}
              </NavLink>
            ))}
          </div>

          <button
            type="button"
            className="rail__item rail__signout"
            title={`Sign out (${role ?? 'no role'})`}
            aria-label="Sign out"
            onClick={handleSignOut}
          >
            {/* Inline SVG rather than the ⏻ glyph (U+23FB) — that codepoint has
                spotty coverage outside Chromium's bundled symbol font and rendered
                as a tofu box in Firefox regardless of font-family fallbacks. */}
            <svg
              className="rail__signout-icon"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M8 2v6" />
              <path d="M12 4.5a6 6 0 1 1-8 0" />
            </svg>
          </button>
        </nav>

        <div className="content">
          {/* Keyed on the path so each route fades in as a whole (rule 16a). Without
              it only ListView's rows animated, so a page's header and toolbar snapped
              in around a table that faded — the page never arrived as one thing. */}
          <main className="main main--arrive" key={pathname}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default AppLayout

import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useSession } from '../features/auth/index.js'
import { configFor } from '../features/dashboard/index.js'
import './AppLayout.css'

function AppLayout() {
  const { role, signOut } = useSession()
  const navigate = useNavigate()

  // The rail is whatever the signed-in role's config declares.
  const navItems = configFor(role)?.nav ?? []

  function handleSignOut() {
    signOut()
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
            ⏻
          </button>
        </nav>

        <div className="content">
          <main className="main">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default AppLayout

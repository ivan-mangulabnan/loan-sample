import { NavLink, Outlet } from 'react-router-dom'
import './AppLayout.css'

function AppLayout() {
  return (
    <div className="app">
      <nav className="nav">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/applications">Applications</NavLink>
      </nav>

      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout

import { useSession } from '../../auth/index.js'

function greetingName({ firstName, lastName, name }) {
  if (firstName) return firstName
  if (lastName) return name || lastName

  return null
}

function DashboardGreeting({ subtitle }) {
  const session = useSession()
  const who = greetingName(session)

  return (
    <header className="page-head">
      <div>
        <h1 className="heading">{who ? `Welcome, ${who}` : 'Welcome'}</h1>
        <p className="staff__subtitle">{subtitle}</p>
      </div>
    </header>
  )
}

export default DashboardGreeting

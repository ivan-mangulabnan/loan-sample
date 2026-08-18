import { useSession } from '../../auth/index.js'

/**
 * Picks what to call the reader.
 *
 * `name` is not the first fallback it looks like. `/Auth/me` flattens it from the
 * account, and when there is no account it falls back to the **login handle** — greeting
 * someone "Welcome, loaner-t1-a1b2c3d4" is worse than not greeting them by name at all.
 * `lastName` is the tell: it is present exactly when the account is, so `name` is only
 * reached once we know it is a person's name.
 */
function greetingName({ firstName, lastName, name }) {
  if (firstName) return firstName
  if (lastName) return name || lastName

  return null
}

/**
 * The dashboard heading: a greeting, not a queue title. The queue titles moved to the
 * area pages, which is where they name the thing on screen — a dashboard that says
 * "Review queue" over a chart and a pipeline is describing a page the reader is not on.
 *
 * The subtitle still comes from roleConfig, so a Reviewer's overview and an Admin's stay
 * distinguishable at a glance (rule 17).
 */
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

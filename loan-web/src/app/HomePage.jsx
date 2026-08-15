import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <section>
      <h1>LoanApp</h1>
      <p>
        Go to <Link to="/applications">applications</Link>.
      </p>
    </section>
  )
}

export default HomePage

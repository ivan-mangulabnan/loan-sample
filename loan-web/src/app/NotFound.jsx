import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <section>
      <h1>404</h1>
      <p>That page does not exist.</p>
      <Link to="/">Back to home</Link>
    </section>
  )
}

export default NotFound

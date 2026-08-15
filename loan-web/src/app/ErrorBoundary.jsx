import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'
import NotFound from './NotFound.jsx'

function ErrorBoundary() {
  const error = useRouteError()

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFound />
  }

  return (
    <section>
      <h1>Something went wrong</h1>
      <p>{error?.message ?? 'Unexpected error.'}</p>
      <Link to="/">Back to home</Link>
    </section>
  )
}

export default ErrorBoundary

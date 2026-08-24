import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Button from '../../../components/Button.jsx'
import AuthScreen from '../components/AuthScreen.jsx'
import { useSession } from '../hooks.js'
import './LoginPage.css'

export function LoginPage() {
  const { signIn, isAuthenticated, isLoading } = useSession()
  const navigate = useNavigate()
  const location = useLocation()

  const [tenantId, setTenantId] = useState('1')
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await signIn({ tenantId: Number(tenantId), userName, password })
      navigate(location.state?.from ?? '/', { replace: true })
    } catch (err) {
      setError(
        err.status === 401
          ? 'That username or password is not correct.'
          : (err.message ?? 'Sign in failed.'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <div className="session-splash" />

  if (isAuthenticated) return <Navigate to="/" replace />

  return (
    <AuthScreen
      title="Sign in"
      subtitle="LoanApp staff console"
      footer={
        <p className="login__alt">
          No account? <Link to="/register">Create one</Link>
        </p>
      }
    >
      {location.state?.notice && (
        <p className="login__notice" role="status">
          {location.state.notice}
        </p>
      )}

      <form className="login__form" onSubmit={handleSubmit}>
        <label className="login__label" htmlFor="tenantId">
          Tenant
        </label>
        <select
          id="tenantId"
          className="field field--input"
          value={tenantId}
          onChange={(event) => setTenantId(event.target.value)}
        >
          <option value="1">Jitsu Finance</option>
          <option value="2">Mejia Finance</option>
        </select>

        <label className="login__label" htmlFor="userName">
          Username
        </label>
        <input
          id="userName"
          className="field field--input"
          value={userName}
          autoComplete="username"
          onChange={(event) => setUserName(event.target.value)}
          required
        />

        <label className="login__label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          className="field field--input"
          type="password"
          value={password}
          autoComplete="current-password"
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {error && (
          <p className="login__error" role="alert">
            {error}
          </p>
        )}

        <Button variant="accent" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthScreen>
  )
}

export default LoginPage

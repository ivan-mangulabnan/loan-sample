import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Button from '../../../components/Button.jsx'
import Stepper from '../../../components/Stepper.jsx'
import AuthScreen from '../components/AuthScreen.jsx'
import { messageFrom } from '../../../lib/apiError.js'
import { register } from '../api.js'
import { useSession } from '../hooks.js'
import './RegisterPage.css'

const STEPS = ['Sign-in details', 'About you']

const EMPTY = {
  tenantId: '1',
  userName: '',
  password: '',
  firstName: '',
  middleName: '',
  lastName: '',
  birthdate: '',
}

// Only the 409 needs saying differently here: the server answers a duplicate username
// with a bare "Conflict", which names no field. Everything else — ProblemDetails
// validation, the raw string an unknown tenant produces — is the shared decoding.
function messageFor(error) {
  if (error.status === 409)
    return 'That username is already taken for this tenant.'

  return messageFrom(error, 'Could not create the account.')
}

export function RegisterPage() {
  const { isAuthenticated, isLoading } = useSession()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function update(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  // Step 1 is 'done' only once it is both left behind and accepted — a 409 or an
  // unknown tenant sends the user back here, and a check mark on a step the
  // server just rejected would be a lie. 'waiting' pulses the step that needs
  // input; submitting is not waiting on the user, so it drops back to plain.
  const stepStatus = (n) => {
    if (step === n) return error && n === 1 ? 'invalid' : isSubmitting ? 'active' : 'waiting'
    return step > n ? 'done' : 'todo'
  }

  const steps = STEPS.map((label, index) => ({
    label,
    status: stepStatus(index + 1),
  }))

  // Step 1 sends nothing: the API has a single register endpoint that creates the
  // User and its Account together, so the whole form goes in one request at the
  // end. This only advances the wizard.
  function handleNext(event) {
    event.preventDefault()
    setError(null)
    setStep(2)
  }

  function handleBack() {
    // Keeps the entered values — form state is not reset between steps.
    setError(null)
    setStep(1)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await register({
        tenantId: Number(form.tenantId),
        userName: form.userName,
        password: form.password,
        firstName: form.firstName,
        // The API pattern rejects an empty string, so omit rather than send one.
        middleName: form.middleName.trim() || undefined,
        lastName: form.lastName,
        birthdate: form.birthdate,
      })

      // Register returns a message, not a cookie — the account exists but there is
      // no session yet, so hand off to the login page rather than to the dashboard.
      navigate('/login', {
        replace: true,
        state: { notice: 'Account created. Sign in to continue.' },
      })
    } catch (err) {
      setError(messageFor(err))
      // A duplicate username or an unknown tenant is a step 1 field, so send the
      // user back there — the message is about input they can no longer see.
      if (err.status === 409 || typeof err.body === 'string') setStep(1)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Same reasoning as LoginPage: this route sits outside RequireRole, so until
  // /Auth/me answers, a valid cookie is indistinguishable from no session.
  if (isLoading) return <div className="session-splash" />

  if (isAuthenticated) return <Navigate to="/" replace />

  return (
    <AuthScreen
      title="Create account"
      subtitle="Borrower registration"
      header={<Stepper steps={steps} current={step} />}
      transitionKey={step}
      footer={
        <p className="register__alt">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      }
    >
      {step === 1 ? (
        <form className="register__form" onSubmit={handleNext}>
          <label className="register__label" htmlFor="tenantId">
            Tenant
          </label>
          <select
            id="tenantId"
            className="field field--input"
            value={form.tenantId}
            onChange={update('tenantId')}
          >
            <option value="1">Jitsu Finance</option>
            <option value="2">Mejia Finance</option>
          </select>

          <label className="register__label" htmlFor="userName">
            Username
          </label>
          <input
            id="userName"
            className="field field--input"
            value={form.userName}
            autoComplete="username"
            onChange={update('userName')}
            required
          />

          <label className="register__label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="field field--input"
            type="password"
            value={form.password}
            autoComplete="new-password"
            onChange={update('password')}
            required
          />

          {error && (
            <p className="register__error" role="alert">
              {error}
            </p>
          )}

          <Button variant="accent" type="submit">
            Continue
          </Button>
        </form>
      ) : (
        <form className="register__form" onSubmit={handleSubmit}>
          <label className="register__label" htmlFor="firstName">
            First name
          </label>
          <input
            id="firstName"
            className="field field--input"
            value={form.firstName}
            autoComplete="given-name"
            onChange={update('firstName')}
            required
          />

          <label className="register__label" htmlFor="middleName">
            Middle name <span className="register__optional">optional</span>
          </label>
          <input
            id="middleName"
            className="field field--input"
            value={form.middleName}
            autoComplete="additional-name"
            onChange={update('middleName')}
          />

          <label className="register__label" htmlFor="lastName">
            Last name
          </label>
          <input
            id="lastName"
            className="field field--input"
            value={form.lastName}
            autoComplete="family-name"
            onChange={update('lastName')}
            required
          />

          <label className="register__label" htmlFor="birthdate">
            Date of birth
          </label>
          <input
            id="birthdate"
            className="field field--input"
            type="date"
            value={form.birthdate}
            autoComplete="bday"
            onChange={update('birthdate')}
            required
          />

          {error && (
            <p className="register__error" role="alert">
              {error}
            </p>
          )}

          <div className="register__actions">
            <Button variant="ghost" onClick={handleBack} disabled={isSubmitting}>
              Back
            </Button>
            <Button variant="accent" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </Button>
          </div>
        </form>
      )}
    </AuthScreen>
  )
}

export default RegisterPage

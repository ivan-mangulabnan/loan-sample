import { useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Button from '../../../components/Button.jsx'
import Stepper from '../../../components/Stepper.jsx'
import { useToast } from '../../../components/useToast.js'
import AuthScreen from '../components/AuthScreen.jsx'
import { messageFrom } from '../../../lib/apiError.js'
import { birthdateProblem, earliestBirthdate, latestBirthdate } from '../../../lib/dates.js'
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

function messageFor(error) {
  if (error.status === 409)
    return 'That username is already taken for this tenant.'

  return messageFrom(error, 'Could not create the account.')
}

export function RegisterPage() {
  const { isAuthenticated, isLoading } = useSession()
  const navigate = useNavigate()

  const toast = useToast()

  const [step, setStep] = useState(1)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState(null)
  const [invalidField, setInvalidField] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const birthdateRef = useRef(null)

  function update(field) {
    return (event) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }))
      if (invalidField === field) setInvalidField(null)
    }
  }

  // A server error sends the reader back to step 1; a client-side one is raised against
  // the field in front of them. Marking whichever step actually failed — the old rule
  // hard-coded step 1, so a failure on "About you" drew no cross at all.
  const stepStatus = (n) => {
    if (step !== n) return step > n ? 'done' : 'todo'
    if ((error || invalidField) && step === n) return 'invalid'

    return isSubmitting ? 'active' : 'waiting'
  }

  const steps = STEPS.map((label, index) => ({
    label,
    status: stepStatus(index + 1),
  }))

  function handleNext(event) {
    event.preventDefault()
    setError(null)
    setStep(2)
  }

  function handleBack() {
    setError(null)
    setStep(1)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    // min/max on <input type="date"> only greys the picker out — a typed or pasted
    // value still lands in state, so the rule has to be enforced here as well.
    const problem = birthdateProblem(form.birthdate)

    if (problem) {
      setInvalidField('birthdate')
      birthdateRef.current?.focus()
      toast.push({ message: problem, tone: 'danger' })

      return
    }

    setInvalidField(null)
    setIsSubmitting(true)

    try {
      await register({
        tenantId: Number(form.tenantId),
        userName: form.userName,
        password: form.password,
        firstName: form.firstName,
        middleName: form.middleName.trim() || undefined,
        lastName: form.lastName,
        birthdate: form.birthdate,
      })

      navigate('/login', {
        replace: true,
        state: { notice: 'Account created. Sign in to continue.' },
      })
    } catch (err) {
      setError(messageFor(err))
      if (err.status === 409 || typeof err.body === 'string') setStep(1)
    } finally {
      setIsSubmitting(false)
    }
  }

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
            <span className="req" aria-hidden="true" />
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
            <span className="req" aria-hidden="true" />
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
            <span className="req" aria-hidden="true" />
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
            <span className="req" aria-hidden="true" />
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
            Middle name <span className="register__optional">(Optional)</span>
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
            <span className="req" aria-hidden="true" />
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
            <span className="req" aria-hidden="true" />
          </label>
          <input
            ref={birthdateRef}
            id="birthdate"
            className={`field field--input${
              invalidField === 'birthdate' ? ' field--invalid' : ''
            }`}
            type="date"
            min={earliestBirthdate()}
            max={latestBirthdate()}
            value={form.birthdate}
            autoComplete="bday"
            aria-invalid={invalidField === 'birthdate' || undefined}
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

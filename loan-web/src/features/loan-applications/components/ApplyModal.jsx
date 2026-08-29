import { useRef, useState } from 'react'
import Button from '../../../components/Button.jsx'
import Modal from '../../../components/Modal.jsx'
import { useToast } from '../../../components/useToast.js'
import { usePaymentPlans } from '../hooks.js'
import { repaymentPreview } from '../repayment.js'
import './ApplyModal.css'

const currency = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 2,
})

function ApplyModal({ onSubmit, onClose, isSubmitting = false, error = null }) {
  const plans = usePaymentPlans()

  const [amount, setAmount] = useState('')
  const [planId, setPlanId] = useState('')
  // Which control the toast is about — two fields here, so the ring has to know
  // which one to mark.
  const [invalidField, setInvalidField] = useState(null)

  const amountRef = useRef(null)
  const planRef = useRef(null)

  const toast = useToast()

  const parsed = Number.parseFloat(amount)
  const options = plans.data ?? []
  const selected = options.find((plan) => String(plan.paymentPlanId) === planId) ?? null
  const preview = repaymentPreview(parsed, selected)

  function fail(field, ref, message) {
    setInvalidField(field)
    ref.current?.focus()
    toast.push({ message, tone: 'danger' })
  }

  function handleSubmit() {
    if (!amount.trim() || Number.isNaN(parsed) || parsed <= 0)
      return fail('amount', amountRef, 'Enter how much you want to borrow.')

    if (!selected) return fail('plan', planRef, 'Choose a payment plan.')

    setInvalidField(null)
    onSubmit({ amount: parsed, paymentPlanId: selected.paymentPlanId })
  }

  return (
    <Modal
      open
      title="Apply for a loan"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="accent"
            onClick={handleSubmit}
            disabled={isSubmitting || plans.isLoading}
          >
            {isSubmitting ? 'Submitting…' : 'Submit application'}
          </Button>
        </>
      }
    >
      <label className="apply__label" htmlFor="apply-amount">
        How much do you want to borrow?
        <span className="req" aria-hidden="true" />
      </label>
      <input
        ref={amountRef}
        id="apply-amount"
        className={`field field--input${
          invalidField === 'amount' ? ' field--invalid' : ''
        }`}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={amount}
        placeholder="0.00"
        aria-invalid={invalidField === 'amount' || undefined}
        onChange={(event) => {
          setAmount(event.target.value)
          if (invalidField === 'amount') setInvalidField(null)
        }}
      />

      <label className="apply__label apply__label--spaced" htmlFor="apply-plan">
        Payment plan
        <span className="req" aria-hidden="true" />
      </label>
      {plans.error ? (
        <p className="apply__error" role="alert">
          Could not load the payment plans: {plans.error.message}
        </p>
      ) : (
        <select
          ref={planRef}
          id="apply-plan"
          className={`field field--input${
            invalidField === 'plan' ? ' field--invalid' : ''
          }`}
          value={planId}
          disabled={plans.isLoading}
          aria-invalid={invalidField === 'plan' || undefined}
          onChange={(event) => {
            setPlanId(event.target.value)
            if (invalidField === 'plan') setInvalidField(null)
          }}
        >
          <option value="">
            {plans.isLoading ? 'Loading plans…' : 'Choose a plan'}
          </option>
          {options.map((plan) => (
            <option key={plan.paymentPlanId} value={plan.paymentPlanId}>
              {plan.name} — {plan.numberOfMonths} months at {plan.interestRate}%
            </option>
          ))}
        </select>
      )}

      {preview !== null && (
        <p className="apply__preview">
          <span className="apply__preview-figure">{currency.format(preview)}</span>
          <span className="apply__preview-note">
            to repay over {selected.numberOfMonths} months · indicative until approved
          </span>
        </p>
      )}

      {error && (
        <p className="apply__error" role="alert">
          {error}
        </p>
      )}
    </Modal>
  )
}

export default ApplyModal

import { useState } from 'react'
import Button from '../../../components/Button.jsx'
import Modal from '../../../components/Modal.jsx'
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
  const [problem, setProblem] = useState(null)

  const parsed = Number.parseFloat(amount)
  const options = plans.data ?? []
  const selected = options.find((plan) => String(plan.paymentPlanId) === planId) ?? null
  const preview = repaymentPreview(parsed, selected)

  function handleSubmit() {
    if (!amount.trim() || Number.isNaN(parsed) || parsed <= 0) {
      setProblem('Enter how much you want to borrow.')
      return
    }

    if (!selected) {
      setProblem('Choose a payment plan.')
      return
    }

    setProblem(null)
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
      </label>
      <input
        id="apply-amount"
        className="field field--input"
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={amount}
        placeholder="0.00"
        onChange={(event) => {
          setAmount(event.target.value)
          if (problem) setProblem(null)
        }}
      />

      <label className="apply__label apply__label--spaced" htmlFor="apply-plan">
        Payment plan
      </label>
      {plans.error ? (
        <p className="apply__error" role="alert">
          Could not load the payment plans: {plans.error.message}
        </p>
      ) : (
        <select
          id="apply-plan"
          className="field field--input"
          value={planId}
          disabled={plans.isLoading}
          onChange={(event) => {
            setPlanId(event.target.value)
            if (problem) setProblem(null)
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

      {problem && (
        <p className="apply__error" role="alert">
          {problem}
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

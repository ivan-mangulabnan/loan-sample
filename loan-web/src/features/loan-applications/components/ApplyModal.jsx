import { useState } from 'react'
import Button from '../../../components/Button.jsx'
import Modal from '../../../components/Modal.jsx'
import { usePaymentPlans } from '../hooks.js'
import './ApplyModal.css'

const currency = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 2,
})

/**
 * What the borrower will owe if this application is approved.
 *
 * The same flat calculation the approver's endpoint performs — principal plus a flat
 * percentage, not an amortised schedule (LoanApprovalService). Mirrored here so the form
 * can show a figure rather than leaving the reader to guess what "13%" costs.
 *
 * Indicative, and labelled as such: the rate is read from the plan at APPROVAL time, so
 * a plan repriced in between would settle on a different number. Stating it as the
 * amount owed would be a promise this screen cannot keep.
 */
function repaymentPreview(amount, plan) {
  if (!plan || !Number.isFinite(amount) || amount <= 0) return null

  return Math.round(amount * (1 + plan.interestRate / 100) * 100) / 100
}

/**
 * Applies for a loan — amount plus a plan.
 *
 * Note what is NOT guarded: nothing stops a borrower filing several applications at
 * once, because nothing server-side does either (CreateLoanApplicationAsync has no such
 * rule). Adding the check here alone would invent a limit the API does not keep.
 */
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
          {/* No plan is preselected: the term and the rate differ enough between them
              that a default would be a decision made for the borrower. */}
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
            to repay over {selected.numberOfMonths} months — indicative, the rate is
            fixed when your application is approved
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

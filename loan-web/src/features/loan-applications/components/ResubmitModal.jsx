import { useRef, useState } from 'react'
import IconButton from '../../../components/IconButton.jsx'
import Modal from '../../../components/Modal.jsx'
import { useToast } from '../../../components/useToast.js'
import ModalProgress from './ModalProgress.jsx'
import { DECISION_GLYPHS, DECISIONS } from '../decisions.js'
import { usePaymentPlans } from '../hooks.js'
import { repaymentPreview } from '../repayment.js'
import './ResubmitModal.css'

const currency = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 2,
})

const date = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

function latestRemarks(application) {
  const withText = (application?.reviews ?? []).filter((review) => review.remarks?.trim())

  return withText.length > 0 ? withText[withText.length - 1] : null
}

function ResubmitModal({
  application,
  onSubmit,
  onCancelInstead,
  onClose,
  isSubmitting = false,
  error = null,
}) {
  const plans = usePaymentPlans()

  const [amount, setAmount] = useState(String(application?.amount ?? ''))
  const [planId, setPlanId] = useState(
    String(application?.paymentPlan?.paymentPlanId ?? ''),
  )
  // Which control the toast is about — two fields here, so the ring has to know
  // which one to mark.
  const [invalidField, setInvalidField] = useState(null)

  const amountRef = useRef(null)
  const planRef = useRef(null)

  const toast = useToast()

  if (!application) return null

  const parsed = Number.parseFloat(amount)
  const options = plans.data ?? []
  const selected = options.find((plan) => String(plan.paymentPlanId) === planId) ?? null
  const preview = repaymentPreview(parsed, selected)
  const remarks = latestRemarks(application)

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
      title={`Resubmit application #${application.loanApplicationId}`}
      onClose={onClose}
      footer={
        <>
          <IconButton
            glyph={DECISION_GLYPHS[DECISIONS.Reject]}
            label="Cancel application"
            tone="danger"
            onClick={() => onCancelInstead(application)}
            disabled={isSubmitting}
          />
          <IconButton
            glyph={DECISION_GLYPHS[DECISIONS.Return]}
            label="Resubmit"
            tone="accent"
            busy={isSubmitting}
            onClick={handleSubmit}
            disabled={isSubmitting || plans.isLoading}
          />
        </>
      }
    >
      <ModalProgress application={application} />

      {remarks ? (
        <blockquote className="resub__remarks">
          <p className="resub__remarks-text">{remarks.remarks}</p>
          <footer className="resub__remarks-by">
            Returned {date.format(new Date(remarks.datePosted))}
          </footer>
        </blockquote>
      ) : (
        <p className="resub__lead">
          This application was returned for changes. No reason was recorded.
        </p>
      )}

      <label className="resub__label" htmlFor="resub-amount">
        How much do you want to borrow?
        <span className="req" aria-hidden="true" />
      </label>
      <input
        ref={amountRef}
        id="resub-amount"
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

      <label className="resub__label resub__label--spaced" htmlFor="resub-plan">
        Payment plan
        <span className="req" aria-hidden="true" />
      </label>
      {plans.error ? (
        <p className="resub__error" role="alert">
          Could not load the payment plans: {plans.error.message}
        </p>
      ) : (
        <select
          ref={planRef}
          id="resub-plan"
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
          <option value="">{plans.isLoading ? 'Loading plans…' : 'Choose a plan'}</option>
          {options.map((plan) => (
            <option key={plan.paymentPlanId} value={plan.paymentPlanId}>
              {plan.name} — {plan.numberOfMonths} months at {plan.interestRate}%
            </option>
          ))}
        </select>
      )}

      {preview !== null && (
        <p className="resub__preview">
          <span className="resub__preview-figure">{currency.format(preview)}</span>
          <span className="resub__preview-note">
            to repay over {selected.numberOfMonths} months · indicative until approved
          </span>
        </p>
      )}

      {error && (
        <p className="resub__error" role="alert">
          {error}
        </p>
      )}
    </Modal>
  )
}

export default ResubmitModal

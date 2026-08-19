import { useState } from 'react'
import Button from '../../../components/Button.jsx'
import Modal from '../../../components/Modal.jsx'
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

/**
 * What the reviewer actually said. The API orders reviews oldest-first, so the last one
 * carrying remarks is the reason this application came back.
 *
 * `Reviewer` is null for a borrower — showStaffNames nulls the name, not the text
 * (ReviewApplicationResponse.From, rule 21). The remarks are the point; the name is not.
 */
function latestRemarks(application) {
  const withText = (application?.reviews ?? []).filter((review) => review.remarks?.trim())

  return withText.length > 0 ? withText[withText.length - 1] : null
}

/**
 * The way out of RETURNED_BY_REVIEWER.
 *
 * The reviewer's remarks come first and are not optional furniture: a return without its
 * reason is just a rejection the borrower cannot answer. Everything below them exists so
 * the borrower can act on what they read.
 *
 * Both fields are editable because the reviewer's objection can be to either. Changing
 * only the plan would leave "the amount is too high" unanswerable.
 */
function ResubmitModal({
  application,
  onSubmit,
  onCancelInstead,
  onClose,
  isSubmitting = false,
  error = null,
}) {
  const plans = usePaymentPlans()

  // Prefilled from the record, unlike ApplyModal where a preselected plan would be a
  // decision made for the borrower. Here it is the borrower's own earlier choice, and
  // clearing it would be the odd act — most returns change one field, not both.
  const [amount, setAmount] = useState(String(application?.amount ?? ''))
  const [planId, setPlanId] = useState(
    String(application?.paymentPlan?.paymentPlanId ?? ''),
  )
  const [problem, setProblem] = useState(null)

  if (!application) return null

  const parsed = Number.parseFloat(amount)
  const options = plans.data ?? []
  const selected = options.find((plan) => String(plan.paymentPlanId) === planId) ?? null
  const preview = repaymentPreview(parsed, selected)
  const remarks = latestRemarks(application)

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
      title={`Resubmit application #${application.loanApplicationId}`}
      onClose={onClose}
      footer={
        <>
          {/* "Close" rather than "Cancel": there is a real Cancel on this screen and it
              ends the application. Two different Cancels in one footer is how the wrong
              one gets clicked. */}
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Close
          </Button>
          <Button
            variant="ghost"
            onClick={() => onCancelInstead(application)}
            disabled={isSubmitting}
          >
            Cancel application
          </Button>
          <Button
            variant="accent"
            onClick={handleSubmit}
            disabled={isSubmitting || plans.isLoading}
          >
            {isSubmitting ? 'Resubmitting…' : 'Resubmit'}
          </Button>
        </>
      }
    >
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
      </label>
      <input
        id="resub-amount"
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

      <label className="resub__label resub__label--spaced" htmlFor="resub-plan">
        Payment plan
      </label>
      {plans.error ? (
        <p className="resub__error" role="alert">
          Could not load the payment plans: {plans.error.message}
        </p>
      ) : (
        <select
          id="resub-plan"
          className="field field--input"
          value={planId}
          disabled={plans.isLoading}
          onChange={(event) => {
            setPlanId(event.target.value)
            if (problem) setProblem(null)
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
            to repay over {selected.numberOfMonths} months — indicative, the rate is fixed
            when your application is approved
          </span>
        </p>
      )}

      {problem && (
        <p className="resub__error" role="alert">
          {problem}
        </p>
      )}

      {/* A 409 here means the application moved while this was open — a reviewer picked
          it up, or it was already resubmitted in another tab. The server names which. */}
      {error && (
        <p className="resub__error" role="alert">
          {error}
        </p>
      )}
    </Modal>
  )
}

export default ResubmitModal

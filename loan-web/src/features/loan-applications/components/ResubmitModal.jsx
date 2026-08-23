import { useState } from 'react'
import IconButton from '../../../components/IconButton.jsx'
import Modal from '../../../components/Modal.jsx'
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
          {/* Glyphs, as on the staff decision modals — three labelled buttons is what
              wrapped those footers onto two rows, and the shorter row also buys back the
              height that made this dialog scroll.

              No plain "Close": the header ✕ already dismisses, and a second dismiss in
              the footer was dropped from the staff modals for that reason. What stays is
              the pair of real outcomes, with the destructive one tinted rather than
              filled so it does not invite the click as strongly as Resubmit. */}
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
      {/* Always the returned state: stage one, "Awaiting resubmission", which is
          exactly what the remarks below are asking for. */}
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
          {/* Beside the figure rather than under it, and shorter: the plan select
              directly above already states the term and the rate, so repeating them
              here cost two lines of a dialog that scrolled on a laptop. */}
          <span className="resub__preview-note">
            to repay over {selected.numberOfMonths} months · indicative until approved
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

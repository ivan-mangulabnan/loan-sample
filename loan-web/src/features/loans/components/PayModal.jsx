import { useState } from 'react'
import Button from '../../../components/Button.jsx'
import Modal from '../../../components/Modal.jsx'
import './PayModal.css'

const currency = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 2,
})

/**
 * Posts a payment against one loan.
 *
 * The amount is validated here for the three things the reader can see and fix — not a
 * number, not positive, more than is owed — because each has a better sentence than the
 * API's. Anything else is the server's to refuse.
 *
 * Money is a `decimal` server-side, so the field is `inputMode="decimal"` text rather
 * than a number input: a number input hands back an empty string for "1e5" and for a
 * stray letter alike, which loses the difference between blank and invalid.
 */
function PayModal({ loan, onSubmit, onClose, isSubmitting = false, error = null }) {
  const [amount, setAmount] = useState('')
  const [problem, setProblem] = useState(null)

  if (!loan) return null

  const parsed = Number.parseFloat(amount)
  const balance = loan.balance

  function handleSubmit() {
    if (!amount.trim() || Number.isNaN(parsed)) {
      setProblem('Enter the amount you want to pay.')
      return
    }

    if (parsed <= 0) {
      setProblem('The amount has to be more than zero.')
      return
    }

    // The API refuses this with a 409. Catching it here keeps the reader in the box they
    // are typing in rather than sending them a round trip to be told the same thing.
    if (parsed > balance) {
      setProblem(`That is more than the ${currency.format(balance)} outstanding.`)
      return
    }

    setProblem(null)
    onSubmit({ amount: parsed })
  }

  return (
    <Modal
      open
      title={`Pay loan #${loan.loanId}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="accent" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Posting…' : 'Post payment'}
          </Button>
        </>
      }
    >
      <p className="pay__outstanding">
        <span className="pay__outstanding-label">Outstanding</span>
        <span className="pay__figure">{currency.format(balance)}</span>
      </p>

      <label className="pay__label" htmlFor="pay-amount">
        Amount
      </label>
      <input
        id="pay-amount"
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

      {/* Fills the exact balance rather than a rounded figure: settling a loan is the
          common case, and a cent of drift would be an overpayment the API rejects. */}
      <button
        type="button"
        className="pay__all"
        onClick={() => {
          setAmount(String(balance))
          setProblem(null)
        }}
      >
        Pay it all ({currency.format(balance)})
      </button>

      {problem && (
        <p className="pay__error" role="alert">
          {problem}
        </p>
      )}

      {error && (
        <p className="pay__error" role="alert">
          {error}
        </p>
      )}
    </Modal>
  )
}

export default PayModal

import { useState } from 'react'
import Button from '../../../components/Button.jsx'
import Modal from '../../../components/Modal.jsx'
import './PayModal.css'

const currency = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 2,
})

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

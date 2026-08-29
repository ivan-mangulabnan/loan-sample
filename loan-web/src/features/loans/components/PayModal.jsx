import { useCallback, useRef, useState } from 'react'
import Button from '../../../components/Button.jsx'
import Modal from '../../../components/Modal.jsx'
import { useToast } from '../../../components/useToast.js'
import {
  useClosingProp,
  useClosingValue,
  useResetOnOpen,
} from '../../../hooks/useClosingValue.js'
import './PayModal.css'

const currency = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 2,
})

function PayModal({ loan, onSubmit, onClose, isSubmitting = false, error = null }) {
  const [amount, setAmount] = useState('')
  const [invalid, setInvalid] = useState(false)

  const amountRef = useRef(null)

  const toast = useToast()

  // Held through the exit so the dialog still has something to render while it
  // animates out — see useClosingValue.
  const shown = useClosingValue(loan)

  // Clear the field every time the modal opens — including on the same loan, which
  // is exactly the case that kept showing the amount just posted.
  useResetOnOpen(
    Boolean(loan),
    useCallback(() => {
      setAmount('')
      setInvalid(false)
    }, []),
  )

  // Held so the button does not flip from "Posting…" back to "Post payment" while
  // the dialog fades: the write clears the target and resets isSubmitting together.
  const busy = useClosingProp(isSubmitting, Boolean(loan))

  if (!shown) return null

  const parsed = Number.parseFloat(amount)
  const balance = shown.balance

  // Every rule here points at the same input, so the ring is a plain flag — only the
  // sentence differs.
  function problemWith(value) {
    if (!value.trim() || Number.isNaN(parsed)) return 'Enter the amount you want to pay.'
    if (parsed <= 0) return 'The amount has to be more than zero.'
    if (parsed > balance) return `That is more than the ${currency.format(balance)} outstanding.`

    return null
  }

  function handleSubmit() {
    const problem = problemWith(amount)

    if (problem) {
      setInvalid(true)
      amountRef.current?.focus()
      toast.push({ message: problem, tone: 'danger' })

      return
    }

    setInvalid(false)
    onSubmit({ amount: parsed })
  }

  return (
    <Modal
      open={Boolean(loan)}
      title={`Pay loan #${shown.loanId}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="accent" onClick={handleSubmit} disabled={busy}>
            {busy ? 'Posting…' : 'Post payment'}
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
        <span className="req" aria-hidden="true" />
      </label>
      <input
        ref={amountRef}
        id="pay-amount"
        className={`field field--input${invalid ? ' field--invalid' : ''}`}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={amount}
        placeholder="0.00"
        aria-invalid={invalid || undefined}
        onChange={(event) => {
          setAmount(event.target.value)
          if (invalid) setInvalid(false)
        }}
      />

      <button
        type="button"
        className="pay__all"
        onClick={() => {
          setAmount(String(balance))
          setInvalid(false)
        }}
      >
        Pay it all ({currency.format(balance)})
      </button>

      {error && (
        <p className="pay__error" role="alert">
          {error}
        </p>
      )}
    </Modal>
  )
}

export default PayModal

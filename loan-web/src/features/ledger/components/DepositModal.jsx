import { useCallback, useRef, useState } from 'react'
import Button from '../../../components/Button.jsx'
import Modal from '../../../components/Modal.jsx'
import { useToast } from '../../../components/useToast.js'
import { useClosingProp, useResetOnOpen } from '../../../hooks/useClosingValue.js'
import './DepositModal.css'

const currency = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
})

function DepositModal({ open, balance, onSubmit, onClose, isSubmitting = false, error = null }) {
  const [amount, setAmount] = useState('')
  const [invalid, setInvalid] = useState(false)

  const amountRef = useRef(null)

  const toast = useToast()

  // No row to key on — reset on each fresh open (see ApplyModal).
  useResetOnOpen(
    open,
    useCallback(() => {
      setAmount('')
      setInvalid(false)
    }, []),
  )

  const busy = useClosingProp(isSubmitting, open)

  // No early return on `open`: unmounting here would beat Modal's exit animation.
  // Modal itself holds the dialog on screen for the length of the exit.
  const parsed = Number(amount)
  const isPositive = amount !== '' && Number.isFinite(parsed) && parsed > 0

  function handleSubmit() {
    if (!isPositive) {
      setInvalid(true)
      amountRef.current?.focus()
      toast.push({ message: 'Enter an amount greater than zero.', tone: 'danger' })

      return
    }

    setInvalid(false)
    onSubmit({ amount: parsed })
  }

  return (
    <Modal
      open={open}
      title="Post a capital deposit"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="accent" onClick={handleSubmit} disabled={busy}>
            {busy ? 'Posting…' : 'Post deposit'}
          </Button>
        </>
      }
    >
      <p className="deposit__lead">
        The deposit credits the operating ledger immediately and becomes capital available
        to fund loans. It cannot be undone.
      </p>

      {typeof balance === 'number' && (
        <p className="deposit__balance">
          Current balance <strong>{currency.format(balance)}</strong>
        </p>
      )}

      <label className="deposit__label" htmlFor="deposit-amount">
        Amount
        <span className="req" aria-hidden="true" />
      </label>
      <input
        ref={amountRef}
        id="deposit-amount"
        type="number"
        inputMode="decimal"
        min="0.01"
        step="0.01"
        className={`field field--input${invalid ? ' field--invalid' : ''}`}
        value={amount}
        placeholder="0.00"
        aria-invalid={invalid || undefined}
        onChange={(event) => {
          setAmount(event.target.value)
          if (invalid) setInvalid(false)
        }}
      />

      {error && (
        <p className="deposit__error" role="alert">
          {error}
        </p>
      )}
    </Modal>
  )
}

export default DepositModal

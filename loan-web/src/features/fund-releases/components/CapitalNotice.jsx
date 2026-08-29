import './CapitalNotice.css'

const currency = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
})

// The queue-level statement of a condition the reader cannot fix from a release
// modal: the ledger is short, so some rows below cannot be funded at all. Naming
// the shortfall here is what makes the disabled Release buttons legible.
function CapitalNotice({ balance, shortfall, blocked }) {
  if (blocked === 0) return null

  return (
    <p className="capnotice" role="status">
      <span>
        Capital on hand is{' '}
        <span className="capnotice__figure">{currency.format(balance)}</span> — not enough
        to fund {blocked === 1 ? 'one approved loan' : `${blocked} approved loans`} in this
        queue.
      </span>
      <span>
        Post a deposit of at least{' '}
        <span className="capnotice__figure">{currency.format(shortfall)}</span> to release
        the smallest of them.
      </span>
    </p>
  )
}

export default CapitalNotice

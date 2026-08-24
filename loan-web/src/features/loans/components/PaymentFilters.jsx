import './PaymentFilters.css'

function PaymentFilters({ id, value, onChange }) {
  const set = (key) => (event) => onChange({ ...value, [key]: event.target.value })

  return (
    <>
      <div className="payfilter">
        <span className="payfilter__legend" id={`${id}-date`}>
          Date
        </span>
        <div className="payfilter__pair" role="group" aria-labelledby={`${id}-date`}>
          <label className="visually-hidden" htmlFor={`${id}-from`}>
            Paid on or after
          </label>
          <input
            id={`${id}-from`}
            type="date"
            className="field field--input payfilter__field"
            value={value.from}
            onChange={set('from')}
            max={value.to || undefined}
          />

          <span className="payfilter__to" aria-hidden="true">
            to
          </span>

          <label className="visually-hidden" htmlFor={`${id}-to`}>
            Paid on or before
          </label>
          <input
            id={`${id}-to`}
            type="date"
            className="field field--input payfilter__field"
            value={value.to}
            onChange={set('to')}
            min={value.from || undefined}
          />
        </div>
      </div>

      <div className="payfilter">
        <span className="payfilter__legend" id={`${id}-amt`}>
          Amount
        </span>
        <div className="payfilter__pair" role="group" aria-labelledby={`${id}-amt`}>
          <label className="visually-hidden" htmlFor={`${id}-min`}>
            Smallest amount
          </label>
          <input
            id={`${id}-min`}
            inputMode="decimal"
            className="field field--input payfilter__field payfilter__field--num"
            placeholder="Min"
            value={value.min}
            onChange={set('min')}
          />

          <span className="payfilter__to" aria-hidden="true">
            to
          </span>

          <label className="visually-hidden" htmlFor={`${id}-max`}>
            Largest amount
          </label>
          <input
            id={`${id}-max`}
            inputMode="decimal"
            className="field field--input payfilter__field payfilter__field--num"
            placeholder="Max"
            value={value.max}
            onChange={set('max')}
          />
        </div>
      </div>
    </>
  )
}

export default PaymentFilters

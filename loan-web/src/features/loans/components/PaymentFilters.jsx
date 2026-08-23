import './PaymentFilters.css'

/**
 * Date and amount ranges over a loan's payment history, for ListView's `filters` slot.
 *
 * Ranges rather than single values because the questions people actually ask are
 * "what did I pay in November" and "where is that large payment" — neither of which an
 * equality match answers.
 *
 * **Labelled visibly, not just to a screen reader.** Four bare boxes carrying only
 * placeholders gave no clue which pair was which, and an empty date input shows
 * `mm/dd/yyyy` whether it means "from" or "to". The two ranges are also grouped and
 * ordered — Date then Amount, each low bound before its high one — so the row reads as
 * two controls rather than four loose fields.
 *
 * Controlled by the caller: this renders the inputs and reports changes. The matching
 * happens in `matchesPaymentFilters`, so the rule and the form cannot drift.
 */
function PaymentFilters({ id, value, onChange }) {
  const set = (key) => (event) => onChange({ ...value, [key]: event.target.value })

  return (
    <>
      <div className="payfilter">
        <span className="payfilter__legend" id={`${id}-date`}>
          Date
        </span>
        {/* group, not fieldset: a fieldset's legend cannot sit inline beside its
            controls, and this has to fold into the toolbar row. */}
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
            // A range whose ends cross over matches nothing and looks broken; let the
            // picker refuse it instead of explaining it afterwards.
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
            // inputMode over type=number: money is a decimal, and a number spinner
            // invites the scroll-wheel edit this project avoids elsewhere.
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

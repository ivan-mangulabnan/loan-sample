/**
 * The type filter: transaction CODE to the label the API sends back.
 *
 * Two vocabularies, as with application statuses. TransactionResponse carries both —
 * `type` is the label the table prints, `typeCode` is what this sends — so nothing has to
 * translate one into the other and risk them drifting apart.
 *
 * Mirrors LoanApp/Constants/TransactionTypeCodes.cs and the seeded TransactionType rows.
 * CORRECTION is listed because it is a real, seeded type, but nothing writes one today —
 * the reversal feature it belongs to was modelled and never built, so expect no rows.
 */
export const TRANSACTION_TYPE_OPTIONS = [
  { code: 'CAPITAL_DEPOSIT', label: 'Capital Deposit' },
  { code: 'FUND_RELEASE', label: 'Fund Release' },
  { code: 'PAYMENT', label: 'Payment' },
  { code: 'CORRECTION', label: 'Correction' },
]

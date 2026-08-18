/**
 * The application filter dropdown: status CODE to the label the API sends back.
 *
 * Two vocabularies, and they must not be conflated. `LoanApplicationResponse.Status` is
 * `Status.Label` — "Pending Review" — while the filter has to send `Status.Code` —
 * `PENDING_REVIEW`. Sending the label matches nothing and returns an empty page that
 * looks like a working filter over no data.
 *
 * Separate from statuses.js on purpose: that file maps a *label* to a design tone, which
 * is the opposite direction and a different concern. Codes mirror
 * LoanApp/Constants/LoanApplicationStatusCodes.cs; labels mirror the seeded
 * Status.Label values in LoanApp/Data/LoanAppDbContext.cs.
 */
export const APPLICATION_STATUS_OPTIONS = [
  { code: 'PENDING_REVIEW', label: 'Pending Review' },
  { code: 'PENDING_APPROVAL', label: 'Pending Approval' },
  { code: 'PENDING_RELEASE', label: 'Pending Release' },
  { code: 'APPROVED', label: 'Approved' },
  { code: 'RELEASED', label: 'Released' },
  { code: 'RETURNED_BY_REVIEWER', label: 'Returned by Reviewer' },
  { code: 'REJECTED', label: 'Rejected' },
  { code: 'CANCELLED', label: 'Cancelled' },
]

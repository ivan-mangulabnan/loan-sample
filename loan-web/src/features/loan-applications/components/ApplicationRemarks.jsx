import './ApplicationRemarks.css'

const date = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

/**
 * Every remark anyone left on an application, oldest first.
 *
 * These were written all along and never shown. Reviews and approvals have carried
 * `remarks` in the payload since they existed, but the only renderer in the app read
 * `reviews` alone, took the last entry, and lived inside the resubmit dialog — so a
 * borrower saw a reviewer's reason for returning an application and nothing else. Not
 * why it was rejected, not what the approver said, not why a release was refused.
 *
 * Ordering is by date across all three kinds rather than kind-then-date: this is one
 * conversation about one application, and grouping it by desk would make the reader
 * reassemble the sequence themselves.
 */
function entriesFor(application) {
  const out = []

  for (const review of application?.reviews ?? [])
    out.push({
      step: 'Review',
      status: review.status,
      at: review.datePosted,
      remarks: review.remarks,
    })

  for (const approval of application?.approvals ?? []) {
    out.push({
      step: 'Approval',
      status: approval.status,
      at: approval.approvalDate,
      remarks: approval.remarks,
    })

    // Nested under the approval in the payload because a release decides one approval,
    // but flattened here — the reader is following an application, not a data model.
    for (const release of approval.releases ?? [])
      out.push({
        step: 'Release',
        status: release.status,
        at: release.releaseDate,
        remarks: release.remarks,
      })
  }

  // Remarks are optional at every desk. An entry with none is a decision that was made
  // without comment, and printing an empty quote for it says less than leaving it out.
  return out
    .filter((entry) => entry.remarks?.trim())
    .sort((a, b) => new Date(a.at) - new Date(b.at))
}

/**
 * Staff names are null for a borrower — the API redacts the name, never the text — so
 * every entry is labelled by the desk it came from rather than by who sat at it.
 */
function ApplicationRemarks({ application }) {
  const entries = entriesFor(application)

  if (entries.length === 0)
    return (
      <p className="appremarks__empty">
        Nobody has left a note on this application yet.
      </p>
    )

  return (
    <ol className="appremarks">
      {entries.map((entry, index) => (
        <li className="appremarks__item" key={`${entry.step}-${entry.at}-${index}`}>
          <div className="appremarks__head">
            <span className="appremarks__step">{entry.step}</span>
            <span className="appremarks__outcome">{entry.status}</span>
            <span className="appremarks__date">{date.format(new Date(entry.at))}</span>
          </div>
          <p className="appremarks__text">{entry.remarks}</p>
        </li>
      ))}
    </ol>
  )
}

export default ApplicationRemarks

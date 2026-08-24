import './ApplicationRemarks.css'

const date = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

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

    for (const release of approval.releases ?? [])
      out.push({
        step: 'Release',
        status: release.status,
        at: release.releaseDate,
        remarks: release.remarks,
      })
  }

  return out
    .filter((entry) => entry.remarks?.trim())
    .sort((a, b) => new Date(a.at) - new Date(b.at))
}

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

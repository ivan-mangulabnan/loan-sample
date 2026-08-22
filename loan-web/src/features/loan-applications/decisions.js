/**
 * The decision vocabulary for the review and approval writes.
 *
 * These strings are the C# `Decision` enum's member names. The API registers a
 * JsonStringEnumConverter (LoanApp/Program.cs), so the wire format is "Approve" rather
 * than 0 — but the binding is by name, and an unrecognised name is a 400.
 *
 * Constants rather than inline strings because of how the enum fails. `Decision` is a
 * non-nullable enum and [Required] cannot catch its default, so a payload that omits
 * `decision` entirely binds to 0 — which is **Approve**. A typo is a loud 400; a missing
 * key is a silent approval. Nothing here may build a request body without one of these.
 */
export const DECISIONS = {
  Approve: 'Approve',
  Reject: 'Reject',
  Return: 'Return',
}

/**
 * Decisions the API refuses without remarks — ReviewApplicationService and
 * LoanApprovalService both throw when the text is null or whitespace.
 *
 * Mirrored client-side to keep the guard next to the box the reader is typing in. The
 * server is still the authority: this only saves a round trip that could only ever come
 * back as "Remarks are required...".
 */
export const REQUIRES_REMARKS = [DECISIONS.Reject, DECISIONS.Return]

/** Wording for the action, per decision. The button label and the success notice. */
export const DECISION_LABELS = {
  [DECISIONS.Approve]: 'Approve',
  [DECISIONS.Reject]: 'Reject',
  [DECISIONS.Return]: 'Return for changes',
}

/**
 * The mark each decision carries on a button.
 *
 * The same three glyphs `dashboard/components/PipelineMetric.jsx` already uses for the
 * outcomes these produce — approved ✓, rejected ✕, returned ↺. Reusing them means the
 * button that *causes* an outcome wears the mark of the tile that *counts* it; a second
 * icon vocabulary for one set of concepts is how the two drift apart.
 *
 * Unicode rather than SVG: there is no icon library here, and `Modal`'s ✕ and
 * PipelineMetric's chips are both already plain glyphs.
 */
export const DECISION_GLYPHS = {
  [DECISIONS.Approve]: '✓',
  [DECISIONS.Reject]: '✕',
  [DECISIONS.Return]: '↺',
}

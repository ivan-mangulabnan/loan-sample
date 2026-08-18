import { ROLES } from '../../lib/roles.js'

/**
 * One entry per role. This is the single source of truth for what a role sees:
 * rail items, dashboard heading, and which endpoints feed it. The backend still
 * enforces every gate — this only decides what we bother rendering.
 *
 * Two pieces of copy, two screens. `title` / `subtitle` name the role's AREA page —
 * "Review queue", "Fund release" — and each area page states them itself, because
 * importing this config into one would couple that page to a role (rule 17a). The
 * dashboard is not that page: it greets the reader by name and takes only
 * `dashboardSubtitle`, which is what keeps a Reviewer's overview and an Admin's
 * distinguishable now that neither carries a queue title.
 *
 * `kind` selects the dashboard body:
 *   'queue' — staff working a list of other people's applications. Carries a
 *             single `queue` block naming the endpoint and row shape.
 *   'self'  — a borrower reading their own records. Carries `collections`
 *             instead, because two endpoints feed it.
 *
 * Derived from LoanApp controllers:
 *   Reviewer → GET /api/ReviewApplication/queue   (PENDING_REVIEW)
 *   Approver → GET /api/LoanApproval/queue        (PENDING_APPROVAL)
 *   Admin    → GET /api/FundRelease/queue         (PENDING_RELEASE)
 *              GET /api/Ledger/balance
 *   Loaner   → GET /api/LoanApplication/me, GET /api/Loan/me
 */
export const roleConfig = {
  [ROLES.Reviewer]: {
    kind: 'queue',
    label: 'Reviewer',
    title: 'Review queue',
    subtitle: 'Applications awaiting first-pass review',
    // The line under the greeting on the OVERVIEW. `title`/`subtitle` above name the
    // area page, which is a different screen and hardcodes them itself (rule 17a).
    dashboardSubtitle: 'Your review desk, at a glance',
    queue: {
      path: '/ReviewApplication/queue',
      // The queue returns LoanApplicationResponse[].
      shape: 'application',
      emptyMessage: 'No applications are waiting for review.',
      // Singular/plural copy for the "N waiting" notice. Named per role because the
      // noun differs — an Admin waits on releases, not applications.
      unit: 'application is',
      unitPlural: 'applications are',
      calloutAction: 'Open review queue',
      calloutTo: '/review',
    },
    // The server decides what the headline MEANS; this decides how it is formatted,
    // which is presentation and belongs here.
    stats: {
      path: '/Stats/dashboard',
      days: 7,
      headline: 'count',
      chartCaption: 'Reviews posted per day',
      emptyChartMessage: 'No reviews posted in this period.',
    },
    nav: [
      { to: '/', glyph: '⌂', label: 'Overview', end: true },
      { to: '/review', glyph: '▤', label: 'Review queue' },
      { to: '/applications', glyph: '☰', label: 'All applications' },
    ],
  },

  [ROLES.Approver]: {
    kind: 'queue',
    label: 'Approver',
    title: 'Approval queue',
    subtitle: 'Reviewed applications awaiting a decision',
    dashboardSubtitle: 'Your approval desk, at a glance',
    queue: {
      path: '/LoanApproval/queue',
      shape: 'application',
      emptyMessage: 'No applications are waiting for approval.',
      unit: 'application is',
      unitPlural: 'applications are',
      calloutAction: 'Open approval queue',
      calloutTo: '/approvals',
    },
    stats: {
      path: '/Stats/dashboard',
      days: 7,
      headline: 'amount',
      chartCaption: 'Approved principal per day',
      emptyChartMessage: 'No approvals in this period.',
    },
    nav: [
      { to: '/', glyph: '⌂', label: 'Overview', end: true },
      { to: '/approvals', glyph: '✓', label: 'Approval queue' },
      { to: '/applications', glyph: '☰', label: 'All applications' },
    ],
  },

  [ROLES.Admin]: {
    kind: 'queue',
    label: 'Admin',
    title: 'Fund release',
    subtitle: 'Approved loans awaiting disbursement',
    dashboardSubtitle: 'Disbursement, collections and the capital ledger',
    queue: {
      path: '/FundRelease/queue',
      // The queue returns FundReleaseQueueResponse[] — a different shape.
      shape: 'release',
      emptyMessage: 'Nothing is waiting for release.',
      unit: 'loan is',
      unitPlural: 'loans are',
      calloutAction: 'Open release queue',
      calloutTo: '/releases',
    },
    stats: {
      path: '/Stats/dashboard',
      days: 7,
      headline: 'amount',
      chartCaption: 'Payments collected per day',
      emptyChartMessage: 'No payments collected in this period.',
    },
    // Only Admin can read the capital ledger.
    ledger: { path: '/Ledger/balance' },
    nav: [
      { to: '/', glyph: '⌂', label: 'Overview', end: true },
      { to: '/releases', glyph: '⇄', label: 'Release queue' },
      { to: '/applications', glyph: '☰', label: 'All applications' },
      { to: '/ledger', glyph: '◈', label: 'Ledger' },
    ],
  },

  // No `queue` key on purpose: useRoleQueue(undefined) resolves to [] without a
  // request, so nothing here fires a staff endpoint a borrower cannot call. The `stats`
  // key below is present but points at /Stats/me, which is Loaner-gated.
  [ROLES.Loaner]: {
    kind: 'self',
    label: 'Borrower',
    title: 'My loans',
    subtitle: 'Your applications and active loans',
    dashboardSubtitle: 'Your applications, loans and payments',
    collections: {
      applications: {
        path: '/LoanApplication/me',
        shape: 'application',
        emptyMessage: 'You have not applied for a loan yet.',
      },
      loans: {
        path: '/Loan/me',
        shape: 'loan',
        emptyMessage: 'You have no loans yet.',
      },
    },
    // A different path from the staff block, not a different component: /Stats/me is
    // scoped to this borrower's own rows and returns no tenant-wide field.
    stats: {
      path: '/Stats/me',
      days: 7,
      headline: 'amount',
      chartCaption: 'Payments you made per day',
      emptyChartMessage: 'You have made no payments this week.',
    },
    nav: [
      { to: '/', glyph: '⌂', label: 'Overview', end: true },
      { to: '/applications', glyph: '▤', label: 'My applications' },
      { to: '/loans', glyph: '◈', label: 'My loans' },
    ],
  },
}

export function configFor(role) {
  return roleConfig[role] ?? null
}

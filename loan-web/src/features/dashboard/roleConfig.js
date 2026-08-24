import { ROLES } from '../../lib/roles.js'

export const roleConfig = {
  [ROLES.Reviewer]: {
    kind: 'queue',
    label: 'Reviewer',
    title: 'Review queue',
    subtitle: 'Applications awaiting first-pass review',
    dashboardSubtitle: 'Your review desk, at a glance',
    queue: {
      path: '/ReviewApplication/queue',
      shape: 'application',
      emptyMessage: 'No applications are waiting for review.',
      unit: 'application is',
      unitPlural: 'applications are',
      calloutAction: 'Open review queue',
      calloutTo: '/review',
    },
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
      headline: 'count',
      chartCaption: 'Approved applications per day',
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
    nav: [
      { to: '/', glyph: '⌂', label: 'Overview', end: true },
      { to: '/releases', glyph: '⇄', label: 'Release queue' },
      { to: '/applications', glyph: '☰', label: 'All applications' },
      { to: '/ledger', glyph: '◈', label: 'Ledger' },
    ],
  },

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

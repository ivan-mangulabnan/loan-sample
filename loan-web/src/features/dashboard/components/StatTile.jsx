import IconChip from '../../../components/IconChip.jsx'

/**
 * One figure in the .stats grid. Styling comes from DashboardPage.css, which the
 * page already imports — this owns no CSS of its own.
 */
function StatTile({ tone = 'accent', glyph, label, value, isLoading = false }) {
  return (
    <div>
      <div className="stats__head">
        <IconChip tone={tone}>{glyph}</IconChip>
        <span className="muted">{label}</span>
      </div>
      <p className="stats__value">{isLoading ? '—' : value}</p>
    </div>
  )
}

export default StatTile

import IconChip from '../../../components/IconChip.jsx'

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

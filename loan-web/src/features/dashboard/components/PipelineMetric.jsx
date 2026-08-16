import IconChip from '../../../components/IconChip.jsx'
import Progress from '../../../components/Progress.jsx'

// Icon and tone per metric key. Keyed on the server's stable `key`, never its label,
// so copy changes cannot silently drop the styling.
const PRESENTATION = {
  awaitingReview: { glyph: '⏱', tone: 'warning' },
  awaitingApproval: { glyph: '⏱', tone: 'warning' },
  awaitingRelease: { glyph: '⏱', tone: 'warning' },
  sentToApproval: { glyph: '→', tone: 'info' },
  approved: { glyph: '✓', tone: 'accent' },
  released: { glyph: '⇄', tone: 'accent' },
  returned: { glyph: '↺', tone: 'info' },
  rejected: { glyph: '✕', tone: 'danger' },
  activeLoans: { glyph: '▤', tone: 'info' },
  capital: { glyph: '₱', tone: 'success' },
}

/**
 * One cell of the pipeline grid. `share` is this metric's proportion of the largest in
 * the set — a bar needs something to be relative to, and the server sends raw counts.
 */
function PipelineMetric({ metric, share = 0, format }) {
  const { glyph, tone } = PRESENTATION[metric.key] ?? { glyph: '•', tone: 'accent' }

  // Capital is a money figure with no meaningful count, so it shows its amount.
  const value = metric.key === 'capital' ? format(metric.amount) : metric.count

  return (
    <div className="pipeline__metric">
      <div className="pipeline__head">
        <IconChip tone={tone}>{glyph}</IconChip>
        <span className="pipeline__label">{metric.label}</span>
      </div>

      <p className="pipeline__value">{value}</p>

      <Progress value={share} tone={tone} label={`${metric.label}: ${metric.count}`} />
    </div>
  )
}

export default PipelineMetric

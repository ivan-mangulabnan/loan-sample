import IconChip from '../../../components/IconChip.jsx'
import Progress from '../../../components/Progress.jsx'

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

function PipelineMetric({ metric, share = 0, format }) {
  const { glyph, tone } = PRESENTATION[metric.key] ?? { glyph: '•', tone: 'accent' }

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

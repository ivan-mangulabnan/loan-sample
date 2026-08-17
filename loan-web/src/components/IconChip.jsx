/**
 * Rounded square behind a glyph. tone picks a --*-tint background.
 */
function IconChip({ tone = 'accent', children }) {
  return (
    <span className="icon-chip" style={{ background: `var(--${tone}-tint)` }}>
      {children}
    </span>
  )
}

export default IconChip

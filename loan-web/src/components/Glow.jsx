/**
 * A blurred radial orb for translucent panels. Render one or more inside a
 * GlowHost — never on its own, since it positions against the nearest
 * clipping ancestor.
 *
 * tone:      'accent' | 'info'
 * placement: 'top-left' | 'top-right' | 'bottom-right'
 * color:     overrides tone with any CSS colour (e.g. a per-item tint)
 */
function Glow({ tone = 'accent', placement = 'top-left', color, size, blur }) {
  const style = {}
  if (color) style['--glow-color'] = color
  if (size) style['--glow-size'] = size
  if (blur) style['--glow-blur'] = blur

  return (
    <div
      aria-hidden="true"
      className={`glow glow--${tone} glow--${placement}`}
      style={style}
    />
  )
}

export function GlowHost({ as: Tag = 'div', className = '', children, ...rest }) {
  return (
    <Tag className={`glow-host ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  )
}

export default Glow

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

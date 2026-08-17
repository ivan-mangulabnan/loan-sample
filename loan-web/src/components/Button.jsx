/**
 * variant: 'default' | 'accent' | 'ghost' | 'chip'
 * size:    'md' | 'sm'
 */
function Button({
  variant = 'default',
  size = 'md',
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'btn',
    variant !== 'default' && `btn--${variant}`,
    size !== 'md' && `btn--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  )
}

export default Button

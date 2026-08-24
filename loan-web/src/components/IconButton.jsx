import './IconButton.css'

function IconButton({ glyph, label, tone = 'default', busy = false, className = '', ...rest }) {
  const classes = [
    'iconbtn',
    tone !== 'default' && `iconbtn--${tone}`,
    busy && 'iconbtn--busy',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type="button" className={classes} aria-label={label} {...rest}>
      <span className="iconbtn__glyph" aria-hidden="true">
        {glyph}
      </span>
      <span className="iconbtn__label" aria-hidden="true">
        {busy ? 'Working…' : label}
      </span>
    </button>
  )
}

export default IconButton

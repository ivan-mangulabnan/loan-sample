import './IconButton.css'

/**
 * A square action button whose label appears only on hover or focus.
 *
 * The label is `position: absolute`, so it is out of flow and the button never reserves
 * width for it — revealing it cannot reflow the row. That is the whole reason this
 * exists rather than a `Button` with an icon child: three labelled decision buttons
 * wrapped the modal footer onto two rows at full desktop width, and three glyphs do not.
 *
 * It sits *below* the button, which was decided by measurement rather than taste: in the
 * modal footer there are only 21px above the button before `.modal__body` begins, so a
 * label placed there crosses the border into the body content. Below, it clears
 * everything.
 *
 * Accessibility: `aria-label` names the button whether or not the label is visible, and
 * the visible copy is `aria-hidden` so it is not announced twice. The glyph is
 * decorative for the same reason — the accessible name already says what this does.
 *
 * Generic by design (rule 4): it takes a glyph and a string and knows nothing about
 * loans or decisions.
 */
function IconButton({ glyph, label, tone = 'default', busy = false, className = '', ...rest }) {
  const classes = [
    'iconbtn',
    tone !== 'default' && `iconbtn--${tone}`,
    // Pins the label open while the request is in flight, so the reader can still see
    // which of three near-identical squares they pressed.
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

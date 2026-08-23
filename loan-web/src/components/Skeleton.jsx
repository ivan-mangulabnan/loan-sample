import './Skeleton.css'

/**
 * A grey stand-in for content that has not arrived.
 *
 * Used by the dashboard only. The list pages tried one and kept their "Loading…" text:
 * their rows already fade in on arrival, so the swap was covered, and the placeholder
 * only added a flicker. The dashboard's blocks have no such animation and a chart-sized
 * hole is worth holding, which is the whole case for a skeleton — it earns its place by
 * reserving a shape, not by being a nicer spinner.
 *
 * So callers state a shape, and every variant is measured against the component it
 * stands in for (see rule 12e). A block of arbitrary grey boxes that then reflows into
 * something else is a worse first frame than plain text.
 *
 * Nothing here is drawn unless the load is slow enough to be worth reporting — that is
 * `useDeferredPending`'s job, and the host decides (rule 12f).
 *
 * Deliberately not announced. `aria-hidden` throughout, because a screen reader gets the
 * region's own `aria-busy` from the host and reading out "loading, loading, loading" once
 * per placeholder bar is noise. The host owns the announcement; this is only the picture.
 *
 * `width` and `height` accept any CSS length, so a caller can match a figure whose size
 * it knows; `className` composes a real class where that class already owns the geometry
 * (`.icon-chip`, `.staff__figure`) rather than restating its numbers here.
 */
function Skeleton({ variant = 'text', width, height, className = '' }) {
  const classes = ['skel', `skel--${variant}`, className].filter(Boolean).join(' ')

  return (
    <span
      className={classes}
      aria-hidden="true"
      style={width || height ? { width, height } : undefined}
    />
  )
}

export default Skeleton

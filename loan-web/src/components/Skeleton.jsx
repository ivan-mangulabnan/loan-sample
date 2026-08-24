import './Skeleton.css'

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

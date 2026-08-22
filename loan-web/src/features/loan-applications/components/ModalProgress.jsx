import Stepper from '../../../components/Stepper.jsx'
import { stagesFor, stagesForCode } from '../progress.js'
import './ModalProgress.css'

/**
 * An application's journey, at the top of a modal body.
 *
 * Four modals across two features open on one application — review, approve, release,
 * cancel and resubmit — and every one of them should answer "where is this?" the same
 * way. Wrapping the Stepper here rather than repeating it keeps the stage vocabulary,
 * the size and the spacing in one place.
 *
 * Takes either the status LABEL the API sends (`status`) or a known CODE (`code`). The
 * release desk has the latter and not the former: its queue is pinned to
 * PENDING_RELEASE server-side, and inventing a label there just to translate it back
 * would be a round trip through the one conversion that silently fails (see codeFor).
 *
 * Renders nothing at all for an unrecognised status. A modal opened to act on an
 * application must not blank because one label drifted — the facts below still stand.
 */
function ModalProgress({ status, code }) {
  const steps = code ? stagesForCode(code) : stagesFor(status)
  if (!steps) return null

  return (
    <div className="modal__progress">
      <Stepper steps={steps} size="sm" />
    </div>
  )
}

export default ModalProgress

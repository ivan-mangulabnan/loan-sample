import Stepper from '../../../components/Stepper.jsx'
import { stagesFor, stagesForApplication, stagesForCode } from '../progress.js'
import './ModalProgress.css'

function ModalProgress({ application, status, code }) {
  const steps = application
    ? stagesForApplication(application)
    : code
      ? stagesForCode(code)
      : stagesFor(status)
  if (!steps) return null

  return (
    <div className="modal__progress">
      <Stepper steps={steps} size="sm" />
    </div>
  )
}

export default ModalProgress

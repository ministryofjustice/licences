import { LicenceStage } from '../../data/licenceTypes'
import { TaskState, allComplete } from '../config/taskState'
import { LicenceStatus } from './licenceStatusTypes'

export = function getAllowedTransition(licenceStatus: LicenceStatus) {
  if (!licenceStatus) {
    return null
  }

  if (canSendRoToCa(licenceStatus)) {
    return 'roToCa'
  }

  return null
}

function canSendRoToCa(licenceStatus: LicenceStatus) {
  const { tasks, stage, decisions } = licenceStatus

  if (stage !== LicenceStage.PROCESSING_RO) {
    return false
  }

  if (decisions.bassReferralNeeded && tasks.bassAreaCheck === TaskState.DONE) {
    return true
  }

  if (decisions.curfewAddressRejected) {
    return true
  }

  if (decisions.optedOut) {
    return true
  }

  return allComplete([
    tasks.curfewAddressReview,
    tasks.curfewHours,
    tasks.licenceConditions,
    decisions.approvedPremisesRequired ? TaskState.DONE : tasks.riskManagement,
    tasks.victim,
    tasks.reportingInstructions,
  ])
}

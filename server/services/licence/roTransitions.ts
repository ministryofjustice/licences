import { taskState, allComplete } from '../config/taskState'
import { LicenceStatus } from './licenceStatusTypes'
import { licenceStage } from '../config/licenceStage'

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

  if (stage !== licenceStage.PROCESSING_RO) {
    return false
  }

  if (decisions.bassReferralNeeded && tasks.bassAreaCheck === taskState.DONE) {
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
    decisions.approvedPremisesRequired ? taskState.DONE : tasks.riskManagement,
    tasks.victim,
    tasks.reportingInstructions,
  ])
}

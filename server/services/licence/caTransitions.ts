import { LicenceStage } from '../../data/licenceTypes'
import { LicenceStatus, Decisions, Tasks } from './licenceStatusTypes'

const { TaskState, allComplete } = require('../config/taskState')

const { DECIDED, ELIGIBILITY, MODIFIED, MODIFIED_APPROVAL, PROCESSING_CA } = LicenceStage

export = function getCaTransitions(licenceStatus: LicenceStatus) {
  if (!licenceStatus) {
    return null
  }

  if (canSendCaToDmRefusal(licenceStatus)) {
    return 'caToDmRefusal'
  }

  if (canSendCaToDm(licenceStatus)) {
    return 'caToDm'
  }

  if (canSendCaToRo(licenceStatus)) {
    return 'caToRo'
  }
  return null
}

function canSendCaToRo(licenceStatus: LicenceStatus) {
  const { tasks, decisions, stage } = licenceStatus

  const { eligible, optedOut, bassReferralNeeded, curfewAddressRejected, approvedPremisesRequired } = decisions

  if ([PROCESSING_CA, MODIFIED, MODIFIED_APPROVAL].includes(stage)) {
    if (bassReferralNeeded) {
      if (!approvedPremisesRequired && licenceStatus.tasks.bassAreaCheck === TaskState.UNSTARTED) {
        return true
      }
    } else if (!optedOut && !approvedPremisesRequired && tasks.curfewAddressReview === TaskState.UNSTARTED) {
      return true
    }
  }

  const notToProgress = !eligible || optedOut || curfewAddressRejected

  if (stage !== ELIGIBILITY || notToProgress) {
    return false
  }
  return allComplete([tasks.exclusion, tasks.crdTime, tasks.suitability, tasks.optOut, tasks.curfewAddress])
}

function canSendCaToDmRefusal(licenceStatus: LicenceStatus) {
  const { stage, decisions } = licenceStatus
  const { addressWithdrawn, curfewAddressRejected, finalChecksRefused, bassReferralNeeded } = decisions
  const bassFailure = isBassFailure(decisions)
  if ([PROCESSING_CA, DECIDED, MODIFIED, MODIFIED_APPROVAL].includes(stage)) {
    if (finalChecksRefused) {
      return false
    }

    if (bassReferralNeeded) {
      return bassFailure
    }

    return addressWithdrawn || curfewAddressRejected
  }

  if (stage === ELIGIBILITY) {
    const { eligible, insufficientTimeStop } = decisions

    if (!eligible && !insufficientTimeStop) {
      return false
    }

    return insufficientTimeStop || curfewAddressRejected || bassFailure
  }

  return false
}

function isBassFailure({ bassAreaNotSuitable, bassAccepted, bassWithdrawn }: Decisions) {
  return bassWithdrawn || bassAreaNotSuitable || ['Unsuitable', 'Unavailable'].includes(bassAccepted)
}

function canSendCaToDm(licenceStatus: LicenceStatus) {
  const { tasks, stage, decisions } = licenceStatus

  if (stage === MODIFIED_APPROVAL) {
    return true
  }

  if (stage !== PROCESSING_CA) {
    return false
  }

  if (decisions.insufficientTimeStop) {
    return true
  }

  const tasksComplete = allComplete(getRequiredTasks(decisions, tasks))

  const addressOk =
    decisions.bassReferralNeeded || decisions.curfewAddressApproved || decisions.approvedPremisesRequired

  const decisionsOk = !decisions.excluded && !decisions.postponed && !decisions.finalChecksRefused && addressOk

  return tasksComplete && decisionsOk
}

function getRequiredTasks(decisions: Decisions, tasks: Tasks) {
  if (decisions.approvedPremisesRequired) {
    return [tasks.approvedPremisesAddress, tasks.finalChecks]
  }

  if (decisions.bassReferralNeeded) {
    return [tasks.bassOffer, tasks.finalChecks]
  }

  return [tasks.finalChecks]
}

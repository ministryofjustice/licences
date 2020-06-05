const { taskState } = require('../services/config/taskState')
const { getIn, isEmpty, lastItem } = require('./functionalHelpers')

module.exports = { getBassAreaState, getBassState, getBassRequestState }

function getBassRequestState(licence) {
  const bassRequestAnswer = getIn(licence, ['bassReferral', 'bassRequest', 'bassRequested'])
  const addressProposedAnswer = getIn(licence, ['proposedAddress', 'addressProposed', 'decision'])

  const bassReferralNeeded = bassRequestAnswer === 'Yes' && addressProposedAnswer === 'No'
  const bassAreaSpecified = getIn(licence, ['bassReferral', 'bassRequest', 'specificArea']) !== 'No'
  const bassRequest = getTaskState()

  return {
    bassReferralNeeded,
    bassAreaSpecified,
    bassRequest,
  }

  function getTaskState() {
    if (bassReferralNeeded && bassAreaSpecified) {
      const bassRequestTown = getIn(licence, ['bassReferral', 'bassRequest', 'proposedTown'])
      const bassRequestCounty = getIn(licence, ['bassReferral', 'bassRequest', 'proposedCounty'])

      if (bassRequestTown && bassRequestCounty) {
        return taskState.DONE
      }

      if (bassRequestTown || bassRequestCounty) {
        return taskState.STARTED
      }

      return taskState.UNSTARTED
    }

    return bassRequestAnswer ? taskState.DONE : taskState.UNSTARTED
  }
}

function getBassWithdrawalState(licence) {
  const { bassAreaCheck } = getBassAreaState(licence)
  if (bassAreaCheck === taskState.DONE) {
    return { bassWithdrawn: false }
  }

  const { bassRequest } = getBassRequestState(licence)
  if (bassRequest === taskState.DONE || bassRequest === taskState.STARTED) {
    return { bassWithdrawn: false }
  }
  const bassRejections = getIn(licence, ['bassRejections'])
  const bassWithdrawalReason = isEmpty(bassRejections) ? undefined : lastItem(bassRejections).withdrawal
  const bassWithdrawn = !isEmpty(bassRejections) && !isEmpty(lastItem(bassRejections).withdrawal)

  return { bassWithdrawn, bassWithdrawalReason }
}

function getBassAreaState(licence) {
  const specificArea = getIn(licence, ['bassReferral', 'bassRequest', 'specificArea'])

  if (specificArea === 'No') {
    const seen = getIn(licence, ['bassReferral', 'bassAreaCheck', 'bassAreaCheckSeen'])
    return {
      bassAreaCheck: seen ? taskState.DONE : taskState.UNSTARTED,
    }
  }

  const bassAreaSuitableAnswer = getIn(licence, ['bassReferral', 'bassAreaCheck', 'bassAreaSuitable'])
  const bassAreaReason = getIn(licence, ['bassReferral', 'bassAreaCheck', 'bassAreaReason'])

  const bassAreaSuitable = bassAreaSuitableAnswer && bassAreaSuitableAnswer === 'Yes'
  const bassAreaNotSuitable = bassAreaSuitableAnswer && bassAreaSuitableAnswer === 'No'
  const bassAreaCheck = getBassAreaCheckState(bassAreaSuitableAnswer, bassAreaReason)

  return {
    bassAreaSuitable,
    bassAreaNotSuitable,
    bassAreaCheck,
  }
}

function getBassAreaCheckState(bassAreaSuitableAnswer, bassAreaReason) {
  if (!bassAreaSuitableAnswer) {
    return taskState.UNSTARTED
  }

  if (bassAreaSuitableAnswer === 'No' && !bassAreaReason) {
    return taskState.STARTED
  }

  return taskState.DONE
}

function getBassState(licence) {
  const bassAccepted = getIn(licence, ['bassReferral', 'bassOffer', 'bassAccepted'])
  const bassOffer = getBassOfferState(bassAccepted)
  const { bassWithdrawn, bassWithdrawalReason } = getBassWithdrawalState(licence)
  const bassAddress = getBassAddressState(licence)

  return { bassAccepted, bassOffer, bassWithdrawn, bassWithdrawalReason, bassAddress }
}

function getBassOfferState(bassAccepted) {
  return !bassAccepted ? taskState.UNSTARTED : taskState.DONE
}

function getBassAddressState(licence) {
  const bassOffer = getIn(licence, ['bassReferral', 'bassOffer'])

  if (!bassOffer) {
    return taskState.UNSTARTED
  }

  if (bassOffer.bassAccepted === 'Yes') {
    const required = ['addressTown', 'addressLine1', 'postCode']
    if (required.some((field) => !bassOffer[field])) {
      return taskState.STARTED
    }
  }

  return taskState.DONE
}

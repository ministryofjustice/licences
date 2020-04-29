const { taskStates } = require('../services/config/taskStates')
const { getIn, isEmpty } = require('./functionalHelpers')
const { isAcceptedAddress } = require('./addressHelpers')

module.exports = { getCurfewAddressReviewState, getCurfewAddressState }

function getCurfewAddressState(licence, optedOut, bassReferralNeeded, curfewAddressRejected) {
  const address = getIn(licence, ['proposedAddress', 'curfewAddress']) || {}

  return {
    offenderIsMainOccupier: getIn(address, ['occupier', 'isOffender']) === 'Yes',
    curfewAddress: getAddressState(),
  }

  function getAddressState() {
    if (optedOut || bassReferralNeeded) {
      return taskStates.DONE
    }

    if (isEmpty(address)) {
      return taskStates.UNSTARTED
    }

    if (curfewAddressRejected) {
      return taskStates.STARTED
    }

    const required = ['cautionedAgainstResident', 'addressLine1', 'addressTown', 'postCode']

    if (required.some((field) => !address[field])) {
      return taskStates.STARTED
    }

    const offenderIsMainOccupier = getIn(address, ['occupier', 'isOffender']) === 'Yes'

    if (!offenderIsMainOccupier && !address.telephone) {
      return taskStates.STARTED
    }

    return taskStates.DONE
  }
}

const approvedPremisesAddressState = (licence) => {
  const approvedPremisesAddressAnswer =
    getIn(licence, ['curfew', 'approvedPremisesAddress']) ||
    getIn(licence, ['bassReferral', 'approvedPremisesAddress']) ||
    {}
  if (isEmpty(approvedPremisesAddressAnswer)) {
    return taskStates.UNSTARTED
  }

  if (
    approvedPremisesAddressAnswer.addressLine1 &&
    approvedPremisesAddressAnswer.addressTown &&
    approvedPremisesAddressAnswer.postCode
  ) {
    return taskStates.DONE
  }

  return taskStates.STARTED
}

const taskCompletion = (licence) => {
  const { consent, electricity } = getIn(licence, ['curfew', 'curfewAddressReview']) || {}
  const curfewAddress = getIn(licence, ['proposedAddress', 'curfewAddress']) || {}
  const offenderIsOccupier = getIn(curfewAddress, ['occupier', 'isOffender']) === 'Yes'

  if (offenderIsOccupier && electricity) {
    return taskStates.DONE
  }
  if (consent && electricity) {
    return taskStates.DONE
  }
  if (consent || electricity) {
    return taskStates.STARTED
  }
  return taskStates.UNSTARTED
}

function getCurfewAddressReviewState(licence) {
  const approvedPremisesRequiredAnswer =
    getIn(licence, ['curfew', 'approvedPremises', 'required']) ||
    getIn(licence, ['bassReferral', 'bassAreaCheck', 'approvedPremisesRequiredYesNo']) ||
    {}

  if (approvedPremisesRequiredAnswer === 'Yes') {
    const approvedAddressTaskState = approvedPremisesAddressState(licence)
    return {
      approvedPremisesRequired: true,
      approvedPremisesAddress: approvedAddressTaskState,
      curfewAddressReview: approvedAddressTaskState,
      curfewAddressApproved: false,
      addressReviewFailed: false,
      addressWithdrawn: false,
    }
  }

  const addressReview = getIn(licence, ['curfew', 'curfewAddressReview']) || {}
  const rejectedAddresses = getIn(licence, ['proposedAddress', 'rejections'])
  const curfewAddress = getIn(licence, ['proposedAddress', 'curfewAddress']) || {}
  const addressSuitable = getIn(licence, ['risk', 'riskManagement', 'proposedAddressSuitable'])
  const offenderIsOccupier = getIn(curfewAddress, ['occupier', 'isOffender']) === 'Yes'

  return {
    approvedPremisesRequired: false,
    approvedPremisesAddress: taskStates.UNSTARTED,
    curfewAddressReview: taskCompletion(licence),
    curfewAddressApproved: isAcceptedAddress(addressReview, addressSuitable, offenderIsOccupier),
    addressReviewFailed: addressReview.consent === 'No' || addressReview.electricity === 'No',
    addressWithdrawn: isEmpty(curfewAddress) && rejectedAddresses && rejectedAddresses.length > 0,
  }
}

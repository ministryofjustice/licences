const { taskState } = require('../services/config/taskState')
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
      return taskState.DONE
    }

    if (isEmpty(address)) {
      return taskState.UNSTARTED
    }

    if (curfewAddressRejected) {
      return taskState.STARTED
    }

    const required = ['cautionedAgainstResident', 'addressLine1', 'addressTown', 'postCode']

    if (required.some((field) => !address[field])) {
      return taskState.STARTED
    }

    const offenderIsMainOccupier = getIn(address, ['occupier', 'isOffender']) === 'Yes'

    if (!offenderIsMainOccupier && !address.telephone) {
      return taskState.STARTED
    }

    return taskState.DONE
  }
}

const approvedPremisesAddressState = (licence) => {
  const approvedPremisesAddressAnswer =
    getIn(licence, ['curfew', 'approvedPremisesAddress']) ||
    getIn(licence, ['bassReferral', 'approvedPremisesAddress']) ||
    {}
  if (isEmpty(approvedPremisesAddressAnswer)) {
    return taskState.UNSTARTED
  }

  if (
    approvedPremisesAddressAnswer.addressLine1 &&
    approvedPremisesAddressAnswer.addressTown &&
    approvedPremisesAddressAnswer.postCode
  ) {
    return taskState.DONE
  }

  return taskState.STARTED
}

const taskCompletion = (licence) => {
  const { consent, electricity } = getIn(licence, ['curfew', 'curfewAddressReview']) || {}
  const curfewAddress = getIn(licence, ['proposedAddress', 'curfewAddress']) || {}
  const offenderIsOccupier = getIn(curfewAddress, ['occupier', 'isOffender']) === 'Yes'

  if (offenderIsOccupier && electricity) {
    return taskState.DONE
  }
  if (consent && electricity) {
    return taskState.DONE
  }
  if (consent || electricity) {
    return taskState.STARTED
  }
  return taskState.UNSTARTED
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
    approvedPremisesAddress: taskState.UNSTARTED,
    curfewAddressReview: taskCompletion(licence),
    curfewAddressApproved: isAcceptedAddress(addressReview, addressSuitable, offenderIsOccupier),
    addressReviewFailed: addressReview.consent === 'No' || addressReview.electricity === 'No',
    addressWithdrawn: isEmpty(curfewAddress) && rejectedAddresses && rejectedAddresses.length > 0,
  }
}

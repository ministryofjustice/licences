const { TaskState } = require('../config/taskState')
const { getIn, isEmpty } = require('../../utils/functionalHelpers')
const { isAcceptedAddress } = require('../../utils/addressHelpers')

module.exports = { getCurfewAddressReviewState, getCurfewAddressState }

function getCurfewAddressState(licence, optedOut, bassReferralNeeded, curfewAddressRejected) {
  const address = getIn(licence, ['proposedAddress', 'curfewAddress']) || {}

  return {
    offenderIsMainOccupier: getIn(address, ['occupier', 'isOffender']) === 'Yes',
    curfewAddress: getAddressState(),
  }

  function getAddressState() {
    if (optedOut || bassReferralNeeded) {
      return TaskState.DONE
    }

    if (isEmpty(address)) {
      return TaskState.UNSTARTED
    }

    if (curfewAddressRejected) {
      return TaskState.STARTED
    }

    const required = ['cautionedAgainstResident', 'addressLine1', 'addressTown', 'postCode']

    if (required.some((field) => !address[field])) {
      return TaskState.STARTED
    }

    const offenderIsMainOccupier = getIn(address, ['occupier', 'isOffender']) === 'Yes'

    if (!offenderIsMainOccupier && !address.telephone) {
      return TaskState.STARTED
    }

    return TaskState.DONE
  }
}

const approvedPremisesAddressState = (licence) => {
  const approvedPremisesAddressAnswer =
    getIn(licence, ['curfew', 'approvedPremisesAddress']) ||
    getIn(licence, ['bassReferral', 'approvedPremisesAddress']) ||
    {}
  if (isEmpty(approvedPremisesAddressAnswer)) {
    return TaskState.UNSTARTED
  }

  if (
    approvedPremisesAddressAnswer.addressLine1 &&
    approvedPremisesAddressAnswer.addressTown &&
    approvedPremisesAddressAnswer.postCode
  ) {
    return TaskState.DONE
  }

  return TaskState.STARTED
}

const taskCompletion = (licence) => {
  const { consent, electricity } = getIn(licence, ['curfew', 'curfewAddressReview']) || {}
  const curfewAddress = getIn(licence, ['proposedAddress', 'curfewAddress']) || {}
  const offenderIsOccupier = getIn(curfewAddress, ['occupier', 'isOffender']) === 'Yes'

  if (offenderIsOccupier && electricity) {
    return TaskState.DONE
  }
  if (consent && electricity) {
    return TaskState.DONE
  }
  if (consent || electricity) {
    return TaskState.STARTED
  }
  return TaskState.UNSTARTED
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
    approvedPremisesAddress: TaskState.UNSTARTED,
    curfewAddressReview: taskCompletion(licence),
    curfewAddressApproved: isAcceptedAddress(addressReview, addressSuitable, offenderIsOccupier),
    addressReviewFailed: addressReview.consent === 'No' || addressReview.electricity === 'No',
    addressWithdrawn: isEmpty(curfewAddress) && rejectedAddresses && rejectedAddresses.length > 0,
  }
}

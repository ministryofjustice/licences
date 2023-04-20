const { standardAction, standardActionMulti } = require('../utils/actions')

const getLabel = ({ decisions, tasks }) => {
  const { optedOut, bassReferralNeeded, bassAreaNotSuitable, curfewAddressRejected } = decisions
  const { bassRequest, curfewAddress } = tasks

  if (optedOut) {
    return 'Offender has opted out of HDC'
  }

  if (bassReferralNeeded) {
    if (bassAreaNotSuitable) {
      return 'ALERT||CAS2 area rejected'
    }
    if (bassRequest === 'DONE') {
      return 'Completed'
    }
    return 'Not completed'
  }

  if (curfewAddressRejected) {
    return 'ALERT||Address rejected'
  }

  if (curfewAddress === 'DONE') {
    return 'Completed'
  }

  return 'Not completed'
}

const getAction = ({ decisions, tasks }) => {
  const { curfewAddressRejected, bassAreaNotSuitable } = decisions
  const { curfewAddress, optOut, bassRequest } = tasks

  if (curfewAddressRejected) {
    return standardAction(curfewAddress, '/hdc/proposedAddress/rejected/', 'curfew-address')
  }

  if (bassAreaNotSuitable) {
    return standardAction(curfewAddress, '/hdc/bassReferral/rejected/', 'curfew-address')
  }

  return standardActionMulti([curfewAddress, optOut, bassRequest], '/hdc/proposedAddress/curfewAddressChoice/')
}

module.exports = ({ decisions, tasks }) => {
  return {
    title: 'Curfew address',
    label: getLabel({ decisions, tasks }),
    action: getAction({ decisions, tasks }),
  }
}

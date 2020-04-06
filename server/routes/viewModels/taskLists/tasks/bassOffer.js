const { standardAction, change, viewEdit } = require('./utils/actions')

module.exports = {
  getLabel: ({ decisions, tasks }) => {
    const {
      bassAreaNotSuitable,
      bassWithdrawn,
      bassWithdrawalReason,
      bassAccepted,
      bassAreaSuitable,
      approvedPremisesRequired,
      optedOut,
    } = decisions
    const { bassOffer, bassAreaCheck, approvedPremisesAddress } = tasks

    if (optedOut) {
      return 'Opted out'
    }

    if (bassAreaNotSuitable) {
      return 'BASS area rejected'
    }

    if (bassWithdrawn) {
      if (bassWithdrawalReason === 'offer') {
        return 'BASS offer withdrawn'
      }
      return 'BASS request withdrawn'
    }

    if (bassOffer === 'DONE') {
      if (bassAccepted === 'Yes') {
        return 'Offer made'
      }
      // TODO warning box
      if (bassAccepted === 'Unsuitable') {
        return 'WARNING||Not suitable for BASS'
      }
      return 'WARNING||Address not available'
    }

    if (bassAreaCheck === 'DONE' && bassAreaSuitable && approvedPremisesAddress !== 'DONE') {
      return 'Not completed'
    }

    if (approvedPremisesRequired) {
      return approvedPremisesAddress === 'DONE' ? 'Approved premises required' : 'Not completed'
    }

    return 'BASS referral requested'
  },

  getAction: ({ decisions, tasks }, dataQa) => {
    const { bassWithdrawn, approvedPremisesRequired } = decisions
    const { bassAreaCheck, bassOffer, optOut, curfewAddress, bassRequest } = tasks

    if (bassWithdrawn) {
      return change('/hdc/bassReferral/bassOffer/', dataQa)
    }

    if (bassAreaCheck === 'DONE' && approvedPremisesRequired === true) {
      return viewEdit('/hdc/bassReferral/approvedPremisesChoice/')
    }

    if (bassAreaCheck === 'DONE') {
      return standardAction(bassOffer, '/hdc/bassReferral/bassOffer/', dataQa)
    }

    if ([optOut, curfewAddress, bassRequest].every((task) => task === 'UNSTARTED')) {
      return { text: 'Start now', href: '/hdc/proposedAddress/curfewAddressChoice/', type: 'btn', dataQa }
    }

    if ([optOut, curfewAddress, bassRequest].every((task) => task === 'DONE')) {
      return change('/hdc/proposedAddress/curfewAddressChoice/', dataQa)
    }

    return { text: 'Continue', href: '/hdc/proposedAddress/curfewAddressChoice/', type: 'btn', dataQa }
  },
}

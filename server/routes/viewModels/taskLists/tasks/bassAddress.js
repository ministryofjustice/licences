const { standardAction, viewEdit, change, view } = require('./utils/actions')

const getLabel = ({ decisions, tasks }) => {
  const { bassAreaNotSuitable, bassWithdrawn, bassWithdrawalReason, bassAccepted, approvedPremisesRequired } = decisions
  const { bassOffer, bassAddress } = tasks

  if (approvedPremisesRequired) {
    return 'Approved premises required'
  }

  if (bassAreaNotSuitable) {
    return 'BASS area rejected'
  }

  if (bassWithdrawn) {
    return bassWithdrawalReason === 'offer' ? 'BASS offer withdrawn' : 'BASS request withdrawn'
  }

  if (bassOffer === 'DONE') {
    if (bassAccepted === 'Yes') {
      return bassAddress === 'DONE' ? 'Offer made and address provided' : 'Offer made, awaiting address'
    }
    return bassAccepted === 'Unsuitable' ? 'WARNING||Not suitable for BASS' : 'WARNING||Address not available'
  }

  return 'Not completed'
}

const getAction = ({ tasks }) => {
  const { bassAddress, approvedPremisesAddress } = tasks
  if (approvedPremisesAddress === 'DONE') {
    return viewEdit('/hdc/bassReferral/approvedPremisesChoice/', 'bass-address')
  }
  return standardAction(bassAddress, '/hdc/bassReferral/bassOffer/')
}

const getOfferLabel = ({ decisions, tasks }) => {
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
}

const getOfferAction = ({ decisions, tasks }) => {
  const { bassWithdrawn, approvedPremisesRequired } = decisions
  const { bassAreaCheck, bassOffer, optOut, curfewAddress, bassRequest } = tasks

  if (approvedPremisesRequired === true) {
    return viewEdit('/hdc/bassReferral/approvedPremisesChoice/', 'approved-premises-choice')
  }

  if (bassWithdrawn) {
    return change('/hdc/bassReferral/bassOffer/', 'bass-address')
  }

  if (bassAreaCheck === 'DONE') {
    return standardAction(bassOffer, '/hdc/bassReferral/bassOffer/', 'bass-address')
  }

  if ([optOut, curfewAddress, bassRequest].every((task) => task === 'UNSTARTED')) {
    return {
      text: 'Start now',
      href: '/hdc/proposedAddress/curfewAddressChoice/',
      type: 'btn',
      dataQa: 'bass-address',
    }
  }

  if ([optOut, curfewAddress, bassRequest].every((task) => task === 'DONE')) {
    return change('/hdc/proposedAddress/curfewAddressChoice/', 'bass-address')
  }

  return { text: 'Continue', href: '/hdc/proposedAddress/curfewAddressChoice/', type: 'btn', dataQa: 'bass-address' }
}

const title = 'BASS address'

module.exports = {
  ca: {
    standard: ({ decisions, tasks }) => {
      return {
        title,
        label: getLabel({ decisions, tasks }),
        action: getAction({ tasks }),
      }
    },
    postApproval: ({ decisions, tasks }) => {
      return {
        title,
        label: getOfferLabel({ decisions, tasks }),
        action: getOfferAction({ decisions, tasks }),
      }
    },
  },
  view: ({ decisions, tasks }) => {
    const { approvedPremisesRequired } = decisions
    return {
      title,
      label: getOfferLabel({ decisions, tasks }),
      action: approvedPremisesRequired ? view('/hdc/review/approvedPremisesAddress/') : view('/hdc/review/bassOffer/'),
    }
  },
}

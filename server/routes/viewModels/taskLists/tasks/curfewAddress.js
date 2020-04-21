const { view, viewEdit, standardAction, change } = require('./utils/actions')

module.exports = {
  getLabel: ({ decisions, tasks }) => {
    const { optedOut, addressWithdrawn, addressReviewFailed, approvedPremisesRequired } = decisions
    const { curfewAddressReview, approvedPremisesAddress } = tasks

    if (optedOut) {
      return 'Opted out'
    }
    if (approvedPremisesRequired) {
      return approvedPremisesAddress === 'DONE' ? 'Approved premises required' : 'Not completed'
    }
    if (addressWithdrawn) {
      return 'Address withdrawn'
    }
    if (addressReviewFailed) {
      return 'Address rejected'
    }
    if (curfewAddressReview === 'DONE') {
      return 'Address checked'
    }
    return 'Not completed'
  },

  getRoAction: ({ decisions, tasks }) => {
    const { curfewAddressRejected } = decisions
    const { curfewAddressReview } = tasks

    if (curfewAddressRejected) {
      return {
        text: 'Change',
        href: '/hdc/curfew/approvedPremises/',
        type: 'link',
      }
    }

    return standardAction(curfewAddressReview, '/hdc/curfew/approvedPremises/')
  },

  getCaPostApprovalAction: ({ decisions }) => {
    const { optedOut, addressWithdrawn, approvedPremisesRequired } = decisions

    if (optedOut) {
      return change('/hdc/proposedAddress/curfewAddressChoice/', 'proposed-curfew-address')
    }

    if (approvedPremisesRequired) {
      return viewEdit('/hdc/curfew/approvedPremisesChoice/', 'proposed-curfew-address')
    }

    if (addressWithdrawn) {
      return viewEdit('/hdc/curfew/consentWithdrawn/', 'proposed-curfew-address')
    }
    return viewEdit('/hdc/review/address/', 'proposed-curfew-address')
  },

  getCaProcessingAction: ({ decisions, tasks }) => {
    const { optedOut, approvedPremisesRequired } = decisions
    const { curfewAddress } = tasks

    if (optedOut) {
      return change('/hdc/proposedAddress/curfewAddressChoice/', 'proposed-curfew-address')
    }

    if (approvedPremisesRequired) {
      return viewEdit('/hdc/curfew/approvedPremisesChoice/', 'proposed-curfew-address')
    }

    if (curfewAddress === 'UNSTARTED') {
      return standardAction(curfewAddress, '/hdc/proposedAddress/curfewAddressChoice/', 'proposed-curfew-address')
    }

    return change('/hdc/review/address/', 'proposed-curfew-address')
  },

  getDmAction: ({ decisions }) => {
    const { approvedPremisesRequired } = decisions

    if (approvedPremisesRequired) {
      return view('/hdc/review/approvedPremisesAddress/')
    }

    return view('/hdc/review/address/')
  },

  getDmRejectedAction: () => view('/hdc/review/address/'),
}

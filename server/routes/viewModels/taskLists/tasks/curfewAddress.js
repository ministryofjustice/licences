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

  getCaPostApprovalAction: ({ decisions }, dataQa) => {
    const { optedOut, addressWithdrawn, approvedPremisesRequired } = decisions

    if (optedOut) {
      return change('/hdc/proposedAddress/curfewAddressChoice/', dataQa)
    }

    if (approvedPremisesRequired) {
      return viewEdit('/hdc/curfew/approvedPremisesChoice/', dataQa)
    }

    if (addressWithdrawn) {
      return viewEdit('/hdc/curfew/consentWithdrawn/', dataQa)
    }
    return viewEdit('/hdc/review/address/', dataQa)
  },

  getCaProcessingAction: ({ decisions, tasks }, dataQa) => {
    const { optedOut, approvedPremisesRequired } = decisions
    const { curfewAddress } = tasks

    if (optedOut) {
      return change('/hdc/proposedAddress/curfewAddressChoice/', dataQa)
    }

    if (approvedPremisesRequired) {
      return viewEdit('/hdc/curfew/approvedPremisesChoice/', dataQa)
    }

    if (curfewAddress === 'UNSTARTED') {
      return standardAction(curfewAddress, '/hdc/proposedAddress/curfewAddressChoice/', dataQa)
    }

    return change('/hdc/review/address/', dataQa)
  },

  getDmAction: ({ decisions }) => {
    const { approvedPremisesRequired } = decisions

    if (approvedPremisesRequired) {
      return view('/hdc/review/approvedPremisesAddress/')
    }

    return view('/hdc/review/address/')
  },
}

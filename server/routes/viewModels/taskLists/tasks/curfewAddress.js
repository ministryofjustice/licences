const { viewEdit, standardAction, change } = require('./utils/actions')

module.exports = {
  getLabel: ({ decisions, tasks }) => {
    const { optedOut, addressWithdrawn, addressReviewFailed } = decisions
    const { curfewAddressReview, riskManagement } = tasks

    console.log(curfewAddressReview)
    console.log(riskManagement)

    if (optedOut) {
      return 'Opted out'
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
        href: '/hdc/curfew/curfewAddressReview/',
        type: 'link',
      }
    }

    return standardAction(curfewAddressReview, '/hdc/curfew/curfewAddressReview/')
  },

  getCaPostApprovalAction: ({ decisions }) => {
    const { addressWithdrawn } = decisions

    if (addressWithdrawn) {
      return viewEdit('/hdc/curfew/consentWithdrawn/')
    }
    return viewEdit('/hdc/review/address/')
  },

  getCaProcessingAction: ({ decisions, tasks }) => {
    const { optedOut } = decisions
    const { curfewAddress } = tasks

    if (optedOut || curfewAddress === 'UNSTARTED') {
      return standardAction(curfewAddress, '/hdc/proposedAddress/curfewAddressChoice/')
    }

    return change('/hdc/review/address/')
  },
}

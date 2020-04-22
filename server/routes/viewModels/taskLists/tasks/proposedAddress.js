const { view, viewEdit, standardAction, change } = require('./utils/actions')

const getLabel = ({ decisions, tasks }) => {
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
}

const getCaPostApprovalAction = ({ decisions }) => {
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
}

const getCaProcessingAction = ({ decisions, tasks }) => {
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
}

const title = 'Proposed curfew address'

module.exports = {
  dm: {
    view: ({ decisions, tasks, visible }) => {
      const { approvedPremisesRequired } = decisions
      return {
        title,
        label: getLabel({ decisions, tasks }),
        action: approvedPremisesRequired ? view('/hdc/review/approvedPremisesAddress/') : view('/hdc/review/address/'),
        visible,
      }
    },
    rejected: ({ decisions, tasks, visible }) => ({
      title,
      label: getLabel({ decisions, tasks }),
      action: view('/hdc/review/address/'),
      visible,
    }),
  },

  ca: {
    processing: ({ decisions, tasks, visible }) => ({
      title,
      label: getLabel({ decisions, tasks }),
      action: getCaProcessingAction({ decisions, tasks }),
      visible,
    }),
    postApproval: ({ decisions, tasks, visible }) => ({
      title,
      label: getLabel({ decisions, tasks }),
      action: getCaPostApprovalAction({ decisions }),
      visible,
    }),
  },

  ro: ({ decisions, tasks, visible }) => {
    const { curfewAddressRejected } = decisions
    const { curfewAddressReview } = tasks

    const rejectedTask = {
      text: 'Change',
      href: '/hdc/curfew/approvedPremises/',
      type: 'link',
    }

    return {
      title,
      label: getLabel({ decisions, tasks }),
      action: curfewAddressRejected
        ? rejectedTask
        : standardAction(curfewAddressReview, '/hdc/curfew/approvedPremises/'),
      visible,
    }
  },
}

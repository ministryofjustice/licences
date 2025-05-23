const { continueBtn } = require('./utils/actions')

const getCaAction = ({ decisions, tasks, stage }) => {
  const { approved, bassReferralNeeded, addressWithdrawn, approvedPremisesRequired } = decisions
  const { bassAddress, approvedPremisesAddress } = tasks

  if (!approved || stage === 'MODIFIED_APPROVAL') {
    return null
  }

  if (approvedPremisesRequired) {
    return approvedPremisesAddress === 'DONE' ? continueBtn('/hdc/pdf/selectLicenceType/') : null
  }

  if (bassReferralNeeded) {
    return bassAddress === 'DONE' ? continueBtn('/hdc/pdf/selectLicenceType/') : null
  }

  return addressWithdrawn ? null : continueBtn('/hdc/pdf/selectLicenceType/')
}

module.exports = {
  ca: ({ decisions, tasks, stage }) => {
    const { useCvlForLicenceCreation } = decisions
    return {
      title: 'Create licence',
      label: useCvlForLicenceCreation ? 'Check the Create and vary a licence service' : null,
      action: useCvlForLicenceCreation ? null : getCaAction({ decisions, tasks, stage }),
    }
  },
  vary: (version) => () => ({
    title: 'Create licence',
    label: `Ready to create version ${version}`,
    action: { type: 'btn', text: 'Continue', href: '/hdc/pdf/selectLicenceType/' },
  }),
}

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

module.exports = ({ decisions, tasks, stage, visible }) => {
  return {
    title: 'Create licence',
    action: getCaAction({ decisions, tasks, stage }),
    visible,
  }
}

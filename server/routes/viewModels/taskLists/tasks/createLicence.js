const { continueBtn } = require('./utils/actions')

module.exports = {
  getCaAction: ({ decisions, tasks, stage }) => {
    const { approved, bassReferralNeeded, addressWithdrawn, approvedPremisesRequired } = decisions
    const { bassAddress, approvedPremisesAddress } = tasks

    if (!approved || stage === 'MODIFIED_APPROVAL') {
      return null
    }

    if (approvedPremisesRequired) {
      return approvedPremisesAddress === 'DONE' ? continueBtn('/hdc/pdf/selectLicenceType/', 'continue') : null
    }

    if (bassReferralNeeded) {
      return bassAddress === 'DONE' ? continueBtn('/hdc/pdf/selectLicenceType/', 'continue') : null
    }

    return addressWithdrawn ? null : continueBtn('/hdc/pdf/selectLicenceType/', 'continue')
  },
}

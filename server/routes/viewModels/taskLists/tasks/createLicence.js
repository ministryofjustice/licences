const { continueBtn } = require('./utils/actions')

module.exports = {
  getCaAction: ({ decisions, tasks, stage }) => {
    const { approved, bassReferralNeeded, addressWithdrawn } = decisions
    const { bassAddress } = tasks

    if (!approved || stage === 'MODIFIED_APPROVAL') {
      return null
    }

    if (bassReferralNeeded) {
      return bassAddress === 'DONE' ? continueBtn('/hdc/pdf/selectLicenceType/') : null
    }

    return addressWithdrawn ? null : continueBtn('/hdc/pdf/selectLicenceType/')
  },
}

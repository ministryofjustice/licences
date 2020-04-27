const { tasklist } = require('./tasklistBuilder')
const riskManagement = require('./tasks/riskManagement')
const curfewHours = require('./tasks/curfewHours')
const additionalConditions = require('./tasks/additionalConditions')
const reportingInstructions = require('./tasks/reportingInstructions')
const proposedAddress = require('./tasks/proposedAddress')
const victimLiaison = require('./tasks/victimLiaison')
const bassArea = require('./tasks/bassArea')
const roSubmit = require('./tasks/roSubmit')
const curfewAddressForm = require('./tasks/curfewAddressForm')

module.exports = {
  getRoTasks: ({ decisions, tasks, allowedTransition }) => {
    const {
      bassReferralNeeded,
      addressUnsuitable,
      curfewAddressRejected,
      addressReviewFailed,
      bassAreaNotSuitable,
      approvedPremisesRequired,
    } = decisions

    const addressRejectedInRiskPhase = curfewAddressRejected && addressUnsuitable
    const addressRejectedInReviewPhase = curfewAddressRejected && addressReviewFailed

    const validAddress = !curfewAddressRejected && !bassAreaNotSuitable
    const context = { decisions, tasks, allowedTransition }

    return tasklist(context, [
      [bassArea, bassReferralNeeded],
      [proposedAddress.ro, (!bassReferralNeeded && !curfewAddressRejected) || addressRejectedInReviewPhase],
      [riskManagement.ro, !approvedPremisesRequired && (validAddress || addressRejectedInRiskPhase)],
      [victimLiaison.ro, validAddress],
      [curfewHours.ro, validAddress],
      [additionalConditions.ro, validAddress],
      [reportingInstructions.ro, validAddress],
      [curfewAddressForm],
      [roSubmit],
    ])
  },

  getRoTasksPostApproval: ({ decisions, tasks }) => {
    const { approvedPremisesRequired } = decisions
    const context = { decisions, tasks }
    return tasklist(context, [
      [proposedAddress.ro, approvedPremisesRequired],
      [riskManagement.ro, !approvedPremisesRequired],
      [curfewHours.ro],
      [additionalConditions.ro],
      [reportingInstructions.ro],
      [curfewAddressForm],
    ])
  },
}

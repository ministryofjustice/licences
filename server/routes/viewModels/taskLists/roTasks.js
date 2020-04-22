const riskManagement = require('./tasks/riskManagement')
const curfewHours = require('./tasks/curfewHours')
const additionalConditions = require('./tasks/additionalConditions')
const reportingInstructions = require('./tasks/reportingInstructions')
const proposedAddress = require('./tasks/proposedAddress')
const victimLiaison = require('./tasks/victimLiaison')
const bassArea = require('./tasks/bassArea')
const roSubmit = require('./tasks/roSubmit')

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

    return [
      {
        title: 'BASS area check',
        label: bassArea.getLabel({ decisions, tasks }),
        action: bassArea.getRoAction({ tasks }),
        visible: bassReferralNeeded,
      },
      proposedAddress.ro({
        decisions,
        tasks,
        visible: (!bassReferralNeeded && !curfewAddressRejected) || addressRejectedInReviewPhase,
      }),
      riskManagement.ro({
        decisions,
        tasks,
        visible: !approvedPremisesRequired && (validAddress || addressRejectedInRiskPhase),
      }),
      victimLiaison.ro({ decisions, tasks, visible: validAddress }),
      curfewHours.ro({ tasks, visible: validAddress }),
      additionalConditions.ro({ tasks, decisions, visible: validAddress }),
      reportingInstructions.ro({ tasks, visible: validAddress }),
      curfewAddressFormTask,
      {
        title: 'Submit to prison case admin',
        label: roSubmit.getLabel({ allowedTransition }),
        action: roSubmit.getRoAction({ decisions }),
        visible: true,
      },
    ].filter((task) => task.visible)
  },

  getRoTasksPostApproval: ({ decisions, tasks }) => {
    const { approvedPremisesRequired } = decisions

    return [
      proposedAddress.ro({
        decisions,
        tasks,
        visible: approvedPremisesRequired,
      }),
      riskManagement.ro({ decisions, tasks, visible: !approvedPremisesRequired }),
      curfewHours.ro({ tasks, visible: true }),
      additionalConditions.ro({ tasks, decisions, visible: true }),
      reportingInstructions.ro({ tasks, visible: true }),
      curfewAddressFormTask,
    ].filter((task) => task.visible)
  },
}

const curfewAddressFormTask = {
  title: 'Curfew address check form',
  action: {
    text: 'Create PDF',
    type: 'btn',
    href: '/hdc/forms/curfewAddress/',
    newTab: true,
  },
  visible: true,
}

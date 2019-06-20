const riskManagement = require('./tasks/riskManagement')
const curfewHours = require('./tasks/curfewHours')
const additionalConditions = require('./tasks/additionalConditions')
const reportingInstructions = require('./tasks/reportingInstructions')
const curfewAddress = require('./tasks/curfewAddress')
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
        action: bassArea.getRoAction({ decisions, tasks }),
        visible: bassReferralNeeded,
      },
      {
        title: 'Proposed curfew address',
        label: curfewAddress.getLabel({ decisions, tasks }),
        action: curfewAddress.getRoAction({ decisions, tasks }),
        visible: (!bassReferralNeeded && !curfewAddressRejected) || addressRejectedInReviewPhase,
      },
      {
        title: 'Risk management',
        label: riskManagement.getLabel({ decisions, tasks }),
        action: riskManagement.getRoAction({ decisions, tasks }),
        visible: !approvedPremisesRequired && (validAddress || addressRejectedInRiskPhase),
      },
      {
        title: 'Victim liaison',
        label: victimLiaison.getLabel({ decisions, tasks }),
        action: victimLiaison.getRoAction({ decisions, tasks }),
        visible: validAddress,
      },
      {
        title: 'Curfew hours',
        label: curfewHours.getLabel({ decisions, tasks }),
        action: curfewHours.getRoAction({ decisions, tasks }),
        visible: validAddress,
      },
      {
        title: 'Additional conditions',
        label: additionalConditions.getLabel({ decisions, tasks }),
        action: additionalConditions.getRoAction({ decisions, tasks }),
        visible: validAddress,
      },
      {
        title: 'Reporting instructions',
        label: reportingInstructions.getLabel({ decisions, tasks }),
        action: reportingInstructions.getRoAction({ decisions, tasks }),
        visible: validAddress,
      },
      curfewAddressFormTask,
      {
        title: 'Submit to prison case admin',
        label: roSubmit.getLabel({ allowedTransition }),
        action: roSubmit.getRoAction({ decisions }),
        visible: true,
      },
    ].filter(task => task.visible)
  },

  getRoTasksPostApproval: ({ decisions, tasks }) => {
    const { approvedPremisesRequired } = decisions

    return [
      {
        title: 'Proposed curfew address',
        label: curfewAddress.getLabel({ decisions, tasks }),
        action: curfewAddress.getRoAction({ decisions, tasks }),
        visible: approvedPremisesRequired,
      },
      {
        title: 'Risk management',
        label: riskManagement.getLabel({ decisions, tasks }),
        action: riskManagement.getRoAction({ decisions, tasks }),
        visible: !approvedPremisesRequired,
      },
      {
        title: 'Curfew hours',
        label: curfewHours.getLabel({ decisions, tasks }),
        action: curfewHours.getRoAction({ decisions, tasks }),
        visible: true,
      },
      {
        title: 'Additional conditions',
        label: additionalConditions.getLabel({ decisions, tasks }),
        action: additionalConditions.getRoAction({ decisions, tasks }),
        visible: true,
      },
      {
        title: 'Reporting instructions',
        label: reportingInstructions.getLabel({ decisions, tasks }),
        action: reportingInstructions.getRoAction({ decisions, tasks }),
        visible: true,
      },
      curfewAddressFormTask,
    ].filter(task => task.visible)
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

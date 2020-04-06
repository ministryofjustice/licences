const postponement = require('./tasks/postponement')
const bassOfferTask = require('./tasks/bassOffer')
const bassAddress = require('./tasks/bassAddress')
const curfewAddress = require('./tasks/curfewAddress')
const riskManagement = require('./tasks/riskManagement')
const victimLiaison = require('./tasks/victimLiaison')
const curfewHours = require('./tasks/curfewHours')
const additionalConditions = require('./tasks/additionalConditions')
const reportingInstructions = require('./tasks/reportingInstructions')
const proposedAddress = require('./tasks/proposedAddress')
const caSubmitAddressReview = require('./tasks/caSubmitAddressReview')
const caSubmitRefusal = require('./tasks/caSubmitRefusal')
const caSubmitBassReview = require('./tasks/caSubmitBassReview')
const caSubmitApproval = require('./tasks/caSubmitApproval')
const hdcRefusal = require('./tasks/hdcRefusal')
const createLicence = require('./tasks/createLicence')
const finalChecks = require('./tasks/finalChecks')

const eligibilityTask = {
  task: 'eligibilityTask',
  visible: true,
}

const informOffenderTask = {
  title: 'Inform the offender',
  label: 'You should now tell the offender using the relevant HDC form from NOMIS',
  action: {
    type: 'btn-secondary',
    href: '/caseList/active',
    text: 'Back to case list',
  },
  visible: true,
}

module.exports = {
  getTasksForBlocked: (errorCode) => [
    eligibilityTask,
    informOffenderTask,
    {
      task: 'caBlockedTask',
      errorCode,
    },
  ],

  getCaTasksEligibility: ({ decisions, tasks, allowedTransition }) => {
    const { optedOut, eligible, bassReferralNeeded, addressUnsuitable } = decisions
    const { eligibility, optOut } = tasks

    const eligibilityDone = eligibility === 'DONE'
    const optOutUnstarted = optOut === 'UNSTARTED'
    const optOutRefused = optOut === 'DONE' && !optedOut

    return [
      eligibilityTask,
      {
        ...informOffenderTask,
        visible: eligibilityDone && optOutUnstarted && !optedOut,
      },
      {
        title: 'Curfew address',
        label: proposedAddress.getLabel({ decisions, tasks }),
        action: proposedAddress.getCaAction({ decisions, tasks }),
        visible: eligible,
      },
      {
        title: 'Risk management',
        label: riskManagement.getLabel({ decisions, tasks }),
        action: {
          type: 'btn-secondary',
          href: '/hdc/risk/riskManagement/',
          text: 'View/Edit',
        },
        visible: addressUnsuitable,
      },

      {
        title: 'Submit to decision maker',
        label: caSubmitRefusal.getLabel({ decisions }),
        action: caSubmitRefusal.getCaAction({ decisions }),
        visible: allowedTransition === 'caToDmRefusal',
      },
      {
        title: 'Send for BASS area checks',
        label: caSubmitBassReview.getLabel({ decisions, tasks }),
        action: caSubmitBassReview.getCaAction({ decisions, tasks }),
        visible: optOutRefused && bassReferralNeeded && allowedTransition !== 'caToDmRefusal',
      },
      {
        title: 'Submit curfew address',
        label: caSubmitAddressReview.getLabel({ tasks }),
        action: caSubmitAddressReview.getCaAction({ decisions, tasks }),
        visible: optOutRefused && !bassReferralNeeded && allowedTransition !== 'caToDmRefusal',
      },
    ].filter((task) => task.visible)
  },

  getCaTasksFinalChecks: ({ decisions, tasks, allowedTransition }) => {
    const {
      addressUnsuitable,
      approvedPremisesRequired,
      bassAccepted,
      bassReferralNeeded,
      bassWithdrawn,
      curfewAddressApproved,
      optedOut,
      eligible,
    } = decisions

    const { bassAreaCheck } = tasks
    const bassAreaChecked = bassAreaCheck === 'DONE'
    const bassExcluded = ['Unavailable', 'Unsuitable'].includes(bassAccepted)
    const bassChecksDone = bassReferralNeeded && bassAreaChecked && !bassWithdrawn && !bassExcluded

    const validAddress = approvedPremisesRequired || curfewAddressApproved || bassChecksDone

    const proposedAddressTask = {
      title: 'Proposed curfew address',
      label: curfewAddress.getLabel({ decisions, tasks }),
      action: curfewAddress.getCaProcessingAction({ decisions, tasks }),
      visible: !bassReferralNeeded && allowedTransition !== 'caToRo',
    }

    const curfewAddressTask = {
      title: 'Curfew address',
      label: proposedAddress.getLabel({ decisions, tasks }),
      action: proposedAddress.getCaAction({ decisions, tasks }),
      visible: !bassReferralNeeded && allowedTransition === 'caToRo',
    }

    const bassTask = {
      title: 'BASS address',
      label: bassOfferTask.getLabel({ decisions, tasks }),
      action: bassOfferTask.getAction({ decisions, tasks }),
      visible: bassReferralNeeded,
    }

    const refusalTask = {
      title: null,
      label: hdcRefusal.getLabel({ decisions }),
      action: hdcRefusal.getCaAction({ decisions }),
      visible: true,
    }

    if (optedOut) {
      return [proposedAddressTask, curfewAddressTask, bassTask, refusalTask].filter((task) => task.visible)
    }

    if (!eligible) {
      return [eligibilityTask, informOffenderTask]
    }

    return [
      eligibilityTask,
      proposedAddressTask,
      curfewAddressTask,
      bassTask,
      {
        title: 'Risk management',
        label: riskManagement.getLabel({ decisions, tasks }),
        action: {
          type: 'btn-secondary',
          href: '/hdc/risk/riskManagement/',
          text: 'View/Edit',
        },
        visible:
          (!approvedPremisesRequired && curfewAddressApproved) ||
          addressUnsuitable ||
          (bassChecksDone && !approvedPremisesRequired),
      },
      {
        title: 'Victim liaison',
        label: victimLiaison.getLabel({ decisions, tasks }),
        action: {
          type: 'btn-secondary',
          href: '/hdc/victim/victimLiaison/',
          text: 'View/Edit',
        },
        visible: validAddress,
      },
      {
        title: 'Curfew hours',
        label: curfewHours.getLabel({ tasks }),
        action: {
          type: 'btn-secondary',
          href: '/hdc/curfew/curfewHours/',
          text: 'View/Edit',
        },
        visible: validAddress,
      },
      {
        title: 'Additional conditions',
        label: additionalConditions.getLabel({ decisions, tasks }, 'CA'),
        action: {
          type: 'btn-secondary',
          href: '/hdc/licenceConditions/standard/',
          text: 'View/Edit',
        },
        visible: validAddress,
      },
      {
        title: 'Reporting instructions',
        label: reportingInstructions.getLabel({ tasks }),
        action: {
          type: 'btn-secondary',
          href: '/hdc/reporting/reportingInstructions/',
          text: 'View/Edit',
        },
        visible: validAddress,
      },
      {
        title: 'Review case',
        label: finalChecks.getLabel({ decisions, tasks }),
        action: finalChecks.getCaProcessingAction({ tasks }),
        visible: validAddress,
      },
      {
        title: 'Postpone or refuse',
        label: postponement.getLabel({ decisions }),
        action: postponement.getAction({ decisions }),
        visible: validAddress,
      },
      refusalTask,
      {
        title: 'Submit to decision maker',
        label: caSubmitApproval.getLabel({ decisions, allowedTransition }),
        action: caSubmitApproval.getCaAction({ allowedTransition }),
        visible: allowedTransition !== 'caToDmRefusal' && allowedTransition !== 'caToRo',
      },
      {
        title: 'Submit to decision maker',
        label: caSubmitRefusal.getLabel({ decisions }),
        action: caSubmitRefusal.getCaAction({ decisions }),
        visible: allowedTransition === 'caToDmRefusal',
      },
      {
        title: 'Submit curfew address',
        label: caSubmitAddressReview.getLabel({ tasks }),
        action: caSubmitAddressReview.getCaAction({ decisions, tasks }),
        visible: !bassReferralNeeded && allowedTransition === 'caToRo',
      },
      {
        title: 'Send for BASS area checks',
        label: caSubmitBassReview.getLabel({ decisions, tasks }),
        action: caSubmitBassReview.getCaAction({ decisions, tasks }),
        visible: bassReferralNeeded && allowedTransition === 'caToRo',
      },
    ].filter((task) => task.visible)
  },

  getCaTasksPostApproval: (stage) => ({ decisions, tasks, allowedTransition }) => {
    const {
      curfewAddressApproved,
      approvedPremisesRequired,
      addressUnsuitable,
      eligible,
      bassReferralNeeded,
      bassAccepted,
      bassWithdrawn,
      dmRefused,
    } = decisions

    const { bassOffer } = tasks

    const bassExcluded = ['Unavailable', 'Unsuitable'].includes(bassAccepted)
    const bassOfferMade = bassReferralNeeded && bassOffer === 'DONE' && !bassWithdrawn && !bassExcluded

    const validAddress = approvedPremisesRequired || curfewAddressApproved || bassOfferMade

    const eligibilitySummaryTask = {
      task: 'eligibilitySummaryTask',
      visible: validAddress,
    }

    const invisibleInformOffenderTask = {
      task: 'informOffenderTask',
      visible: true,
    }

    if (!eligible) {
      return [eligibilitySummaryTask, invisibleInformOffenderTask].filter((task) => task.visible)
    }

    return [
      eligibilitySummaryTask,
      {
        title: 'Curfew address',
        label: proposedAddress.getLabel({ decisions, tasks }),
        action: proposedAddress.getCaAction({ decisions, tasks }),
        visible: allowedTransition === 'caToRo',
      },
      {
        title: 'BASS address',
        label: bassAddress.getLabel({ decisions, tasks }),
        action: bassAddress.getCaAction({ tasks }),
        visible: bassReferralNeeded && allowedTransition !== 'caToRo',
      },
      {
        title: 'Proposed curfew address',
        label: curfewAddress.getLabel({ decisions, tasks }),
        action: curfewAddress.getCaPostApprovalAction({ decisions }),
        visible: !bassReferralNeeded && allowedTransition !== 'caToRo',
      },
      {
        title: 'Risk management',
        label: riskManagement.getLabel({ decisions, tasks }),
        action: {
          type: 'btn-secondary',
          href: '/hdc/risk/riskManagement/',
          text: 'View/Edit',
        },
        visible: !approvedPremisesRequired && (curfewAddressApproved || bassOfferMade || addressUnsuitable),
      },
      {
        title: 'Victim liaison',
        label: victimLiaison.getLabel({ decisions, tasks }),
        action: {
          type: 'btn-secondary',
          href: '/hdc/victim/victimLiaison/',
          text: 'View/Edit',
        },
        visible: validAddress,
      },
      {
        title: 'Curfew hours',
        label: curfewHours.getLabel({ tasks }),
        action: {
          type: 'btn-secondary',
          href: '/hdc/curfew/curfewHours/',
          text: 'View/Edit',
        },
        visible: validAddress,
      },
      {
        title: 'Additional conditions',
        label: additionalConditions.getLabel({ decisions, tasks }, 'CA'),
        action: {
          type: 'btn-secondary',
          href: '/hdc/licenceConditions/standard/',
          text: 'View/Edit',
        },
        visible: validAddress,
      },
      {
        title: 'Reporting instructions',
        label: reportingInstructions.getLabel({ tasks }),
        action: {
          type: 'btn-secondary',
          href: '/hdc/reporting/reportingInstructions/',
          text: 'View/Edit',
        },
        visible: validAddress,
      },
      {
        title: 'Review case',
        label: finalChecks.getLabel({ decisions, tasks }),
        action: finalChecks.getCaProcessingAction({ tasks }),
        visible: validAddress,
      },
      {
        title: 'Postpone or refuse',
        label: postponement.getLabel({ decisions }),
        action: postponement.getAction({ decisions }),
        visible: validAddress,
      },
      {
        title: null,
        label: hdcRefusal.getLabel({ decisions }),
        action: hdcRefusal.getCaAction({ decisions }),
        visible: !dmRefused,
      },
      {
        title: 'Submit to decision maker',
        label: caSubmitApproval.getLabel({ decisions, allowedTransition }),
        action: caSubmitApproval.getCaAction({ allowedTransition }),
        visible: allowedTransition === 'caToDm',
      },
      {
        title: 'Submit to decision maker',
        label: caSubmitRefusal.getLabel({ decisions }),
        action: caSubmitRefusal.getCaAction({ decisions }),
        visible: allowedTransition === 'caToDmRefusal',
      },
      {
        title: 'Send for BASS area checks',
        label: caSubmitBassReview.getLabel({ decisions, tasks }),
        action: caSubmitBassReview.getCaAction({ decisions, tasks }),
        visible: bassReferralNeeded && allowedTransition === 'caToRo',
      },
      {
        title: 'Submit curfew address',
        label: caSubmitAddressReview.getLabel({ tasks }),
        action: caSubmitAddressReview.getCaAction({ decisions, tasks }),
        visible: !bassReferralNeeded && allowedTransition === 'caToRo',
      },
      {
        title: 'Create licence',
        action: createLicence.getCaAction({ decisions, tasks, stage }),
        visible: validAddress && !['caToDm', 'caToDmRefusal', 'caToRo'].includes(allowedTransition),
      },
    ].filter((task) => task.visible)
  },
}

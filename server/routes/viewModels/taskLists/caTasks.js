const { postponeOrRefuse } = require('./tasks/postponement')
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
const caSubmitBassReview = require('./tasks/caSubmitBassReview')
const caSubmitToDm = require('./tasks/caSubmitToDm')
const hdcRefusal = require('./tasks/hdcRefusal')
const createLicence = require('./tasks/createLicence')
const finalChecks = require('./tasks/finalChecks')
const caRereferDm = require('./tasks/caRereferDm')

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
        label: curfewAddress.getLabel({ decisions, tasks }),
        action: curfewAddress.getCaAction({ decisions, tasks }),
        visible: eligible,
      },
      riskManagement.edit({ decisions, tasks, visible: addressUnsuitable }),
      caSubmitToDm.refusal({ decisions, visible: allowedTransition === 'caToDmRefusal' }),
      caSubmitBassReview({
        decisions,
        tasks,
        visible: optOutRefused && bassReferralNeeded && allowedTransition !== 'caToDmRefusal',
      }),
      caSubmitAddressReview({
        decisions,
        tasks,
        visible: optOutRefused && !bassReferralNeeded && allowedTransition !== 'caToDmRefusal',
      }),
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

    const curfewAddressTask = {
      title: 'Curfew address',
      label: curfewAddress.getLabel({ decisions, tasks }),
      action: curfewAddress.getCaAction({ decisions, tasks }),
      visible: !bassReferralNeeded && allowedTransition === 'caToRo',
    }

    const bassTask = {
      title: 'BASS address',
      label: bassOfferTask.getLabel({ decisions, tasks }),
      action: bassOfferTask.getAction({ decisions, tasks }),
      visible: bassReferralNeeded,
    }

    if (optedOut) {
      return [
        proposedAddress.ca.processing({
          tasks,
          decisions,
          visible: !bassReferralNeeded && allowedTransition !== 'caToRo',
        }),
        curfewAddressTask,
        bassTask,
        hdcRefusal({ decisions }),
      ].filter((task) => task.visible)
    }

    if (!eligible) {
      return [eligibilityTask, informOffenderTask]
    }

    return [
      eligibilityTask,
      proposedAddress.ca.processing({
        tasks,
        decisions,
        visible: !bassReferralNeeded && allowedTransition !== 'caToRo',
      }),
      curfewAddressTask,
      bassTask,
      riskManagement.edit({
        decisions,
        tasks,
        visible:
          (!approvedPremisesRequired && curfewAddressApproved) ||
          addressUnsuitable ||
          (bassChecksDone && !approvedPremisesRequired),
      }),
      victimLiaison.edit({ decisions, tasks, visible: validAddress }),
      curfewHours.edit({ tasks, visible: validAddress }),
      additionalConditions.edit({ tasks, decisions, visible: validAddress }),
      reportingInstructions.edit({ tasks, visible: validAddress }),
      finalChecks.review({ decisions, tasks, visible: validAddress }),
      postponeOrRefuse({ decisions, visible: validAddress }),
      hdcRefusal({ decisions }),
      caSubmitToDm.approval({
        decisions,
        allowedTransition,
        visible: allowedTransition !== 'caToDmRefusal' && allowedTransition !== 'caToRo',
      }),
      caSubmitToDm.refusal({
        decisions,
        visible: allowedTransition === 'caToDmRefusal',
      }),
      caSubmitAddressReview({
        decisions,
        tasks,
        visible: !bassReferralNeeded && allowedTransition === 'caToRo',
      }),
      caSubmitBassReview({
        decisions,
        tasks,
        visible: bassReferralNeeded && allowedTransition === 'caToRo',
      }),
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
        label: curfewAddress.getLabel({ decisions, tasks }),
        action: curfewAddress.getCaAction({ decisions, tasks }),
        visible: allowedTransition === 'caToRo',
      },
      {
        title: 'BASS address',
        label: bassAddress.getLabel({ decisions, tasks }),
        action: bassAddress.getCaAction({ tasks }),
        visible: bassReferralNeeded && allowedTransition !== 'caToRo',
      },
      proposedAddress.ca.postApproval({
        tasks,
        decisions,
        visible: !bassReferralNeeded && allowedTransition !== 'caToRo',
      }),
      riskManagement.edit({
        decisions,
        tasks,
        visible: !approvedPremisesRequired && (curfewAddressApproved || bassOfferMade || addressUnsuitable),
      }),
      victimLiaison.edit({ decisions, tasks, visible: validAddress }),
      curfewHours.edit({ tasks, visible: validAddress }),
      additionalConditions.edit({ tasks, decisions, visible: validAddress }),
      reportingInstructions.edit({ tasks, visible: validAddress }),
      finalChecks.review({
        decisions,
        tasks,
        visible: validAddress,
      }),
      postponeOrRefuse({
        decisions,
        visible: validAddress && !dmRefused,
      }),
      hdcRefusal({
        decisions,
        visible: !dmRefused,
      }),
      caSubmitToDm.approval({
        decisions,
        allowedTransition,
        visible: allowedTransition === 'caToDm',
      }),
      caSubmitToDm.refusal({
        decisions,
        visible: allowedTransition === 'caToDmRefusal',
      }),
      caSubmitBassReview({
        decisions,
        tasks,
        visible: bassReferralNeeded && allowedTransition === 'caToRo',
      }),
      caSubmitAddressReview({
        decisions,
        tasks,
        visible: !bassReferralNeeded && allowedTransition === 'caToRo',
      }),
      caRereferDm({
        visible: !['caToDm', 'caToDmRefusal', 'caToRo'].includes(allowedTransition) && dmRefused !== undefined,
      }),
      {
        title: 'Create licence',
        action: createLicence.getCaAction({ decisions, tasks, stage }),
        visible: validAddress && !['caToDm', 'caToDmRefusal', 'caToRo'].includes(allowedTransition) && !dmRefused,
      },
    ].filter((task) => task.visible)
  },
}

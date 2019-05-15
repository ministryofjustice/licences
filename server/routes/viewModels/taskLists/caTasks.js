const postponement = require('../taskLists/tasks/postponement')
const bassOfferTask = require('../taskLists/tasks/bassOffer')
const bassAddress = require('../taskLists/tasks/bassAddress')
const curfewAddress = require('../taskLists/tasks/curfewAddress')
const riskManagement = require('../taskLists/tasks/riskManagement')
const victimLiaison = require('../taskLists/tasks/victimLiaison')
const curfewHours = require('../taskLists/tasks/curfewHours')
const additionalConditions = require('../taskLists/tasks/additionalConditions')
const reportingInstructions = require('../taskLists/tasks/reportingInstructions')
const proposedAddress = require('../taskLists/tasks/proposedAddress')
const caSubmitAddressReview = require('../taskLists/tasks/caSubmitAddressReview')
const caSubmitRefusal = require('../taskLists/tasks/caSubmitRefusal')
const caSubmitBassReview = require('../taskLists/tasks/caSubmitBassReview')
const caSubmitApproval = require('../taskLists/tasks/caSubmitApproval')
const hdcRefusal = require('../taskLists/tasks/hdcRefusal')
const createLicence = require('../taskLists/tasks/createLicence')
const finalChecks = require('./tasks/finalChecks')

module.exports = {
  getCaTasksEligibility: ({ decisions, tasks, allowedTransition }) => {
    const { optedOut, eligible, bassReferralNeeded } = decisions
    const { eligibility, optOut } = tasks

    const eligibilityDone = eligibility === 'DONE'
    const optOutUnstarted = optOut === 'UNSTARTED'
    const optOutRefused = optOut === 'DONE' && !optedOut

    return [
      {
        task: 'eligibilityTask',
        visible: true,
      },
      {
        title: 'Inform the offender',
        label: 'You should now tell the offender using the relevant HDC form from NOMIS',
        action: {
          type: 'btn-secondary',
          href: '/caseList/active',
          text: 'Back to case list',
        },
        visible: eligibilityDone && optOutUnstarted && !optedOut,
      },
      {
        title: 'Curfew address',
        label: proposedAddress.getLabel({ decisions, tasks }),
        action: proposedAddress.getCaAction({ decisions, tasks }),
        visible: eligible,
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
    ].filter(task => task.visible)
  },

  getCaTasksFinalChecks: ({ decisions, tasks, allowedTransition }) => {
    const {
      bassReferralNeeded,
      bassWithdrawn,
      bassAccepted,
      approvedPremisesRequired,
      curfewAddressApproved,
      addressUnsuitable,
      optedOut,
    } = decisions

    const { bassAreaCheck } = tasks
    const bassAreaChecked = bassAreaCheck === 'DONE'
    const bassExcluded = ['Unavailable', 'Unsuitable'].includes(bassAccepted)
    const bassChecksDone = bassReferralNeeded && bassAreaChecked && !bassWithdrawn && !bassExcluded

    const validAddress = approvedPremisesRequired || curfewAddressApproved || bassChecksDone

    if (optedOut) {
      return [
        {
          title: 'Proposed curfew address',
          label: curfewAddress.getLabel({ decisions, tasks }),
          action: curfewAddress.getCaProcessingAction({ decisions, tasks }),
          visible: !bassReferralNeeded && allowedTransition !== 'caToRo',
        },
        {
          title: 'Curfew address',
          label: proposedAddress.getLabel({ decisions, tasks }),
          action: proposedAddress.getCaAction({ decisions, tasks }),
          visible: allowedTransition === 'caToRo',
        },
        {
          title: 'BASS address',
          label: bassOfferTask.getLabel({ decisions, tasks }),
          action: bassOfferTask.getAction({ decisions, tasks }),
          visible: bassReferralNeeded,
        },
        {
          title: null,
          label: hdcRefusal.getLabel({ decisions }),
          action: hdcRefusal.getCaAction({ decisions }),
          visible: true,
        },
      ].filter(task => task.visible)
    }

    return [
      {
        title: 'Proposed curfew address',
        label: curfewAddress.getLabel({ decisions, tasks }),
        action: curfewAddress.getCaProcessingAction({ decisions, tasks }),
        visible: !bassReferralNeeded && allowedTransition !== 'caToRo',
      },
      {
        title: 'Curfew address',
        label: proposedAddress.getLabel({ decisions, tasks }),
        action: proposedAddress.getCaAction({ decisions, tasks }),
        visible: allowedTransition === 'caToRo',
      },
      {
        title: 'BASS address',
        label: bassOfferTask.getLabel({ decisions, tasks }),
        action: bassOfferTask.getAction({ decisions, tasks }),
        visible: bassReferralNeeded,
      },
      {
        title: 'Risk management',
        label: riskManagement.getLabel({ decisions, tasks }),
        action: {
          type: 'btn-secondary',
          href: '/hdc/risk/riskManagement/',
          text: 'View/Edit',
        },
        visible: (!approvedPremisesRequired && curfewAddressApproved) || addressUnsuitable || bassChecksDone,
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
        label: curfewHours.getLabel({ decisions, tasks }),
        action: {
          type: 'btn-secondary',
          href: '/hdc/curfew/curfewHours/',
          text: 'View/Edit',
        },
        visible: validAddress,
      },
      {
        title: 'Additional conditions',
        label: additionalConditions.getLabel({ decisions, tasks }),
        action: {
          type: 'btn-secondary',
          href: '/hdc/review/conditions/',
          text: 'View',
        },
        visible: validAddress,
      },
      {
        title: 'Reporting instructions',
        label: reportingInstructions.getLabel({ decisions, tasks }),
        action: {
          type: 'btn-secondary',
          href: '/hdc/review/reporting/',
          text: 'View',
        },
        visible: validAddress,
      },
      {
        title: 'Review case',
        label: finalChecks.getLabel({ decisions, tasks }),
        action: finalChecks.getCaProcessingAction({ decisions, tasks }),
        visible: validAddress,
      },
      {
        title: 'Postpone or refuse',
        label: postponement.getLabel({ decisions, tasks }),
        action: postponement.getAction({ decisions, tasks }),
        visible: validAddress,
      },
      {
        title: null,
        label: hdcRefusal.getLabel({ decisions }),
        action: hdcRefusal.getCaAction({ decisions }),
        visible: true,
      },
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
    ].filter(task => task.visible)
  },

  getCaTasksPostApproval: stage => ({ decisions, tasks, allowedTransition }) => {
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

    if (!eligible) {
      return [
        {
          task: 'eligibilitySummaryTask',
          visible: validAddress,
        },
        {
          task: 'informOffenderTask',
          visible: true,
        },
      ].filter(task => task.visible)
    }

    return [
      {
        task: 'eligibilitySummaryTask',
        visible: validAddress,
      },
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
        action: curfewAddress.getCaPostApprovalAction({ decisions, tasks }),
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
        label: curfewHours.getLabel({ decisions, tasks }),
        action: {
          type: 'btn-secondary',
          href: '/hdc/curfew/curfewHours/',
          text: 'View/Edit',
        },
        visible: validAddress,
      },
      {
        title: 'Additional conditions',
        label: additionalConditions.getLabel({ decisions, tasks }),
        action: {
          type: 'btn-secondary',
          href: '/hdc/licenceConditions/standard/',
          text: 'View/Edit',
        },
        visible: validAddress,
      },
      {
        title: 'Reporting instructions',
        label: reportingInstructions.getLabel({ decisions, tasks }),
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
        action: finalChecks.getCaProcessingAction({ decisions, tasks }),
        visible: validAddress,
      },
      {
        title: 'Postpone or refuse',
        label: postponement.getLabel({ decisions, tasks }),
        action: postponement.getAction({ decisions, tasks }),
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
    ].filter(task => task.visible)
  },
}

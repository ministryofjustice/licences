const { tasklist, namedTask } = require('./tasklistBuilder')
const { postponeOrRefuse } = require('./tasks/postponement')
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
const informOffenderTask = require('./tasks/informOffenderTask')
const createLicence = require('./tasks/createLicence')
const finalChecks = require('./tasks/finalChecks')
const caRereferDm = require('./tasks/caRereferDm')

const caBlocked = (errorCode) => () => ({ task: 'caBlockedTask', errorCode })
const eligibilityTask = namedTask('eligibilityTask')
const eligibilitySummaryTask = namedTask('eligibilitySummaryTask')
const invisibleInformOffenderTask = namedTask('informOffenderTask')

module.exports = {
  getTasksForBlocked: (errorCode) =>
    tasklist({}, [
      [eligibilityTask, true],
      [informOffenderTask, true],
      [caBlocked(errorCode), true],
    ]),

  getCaTasksEligibility: ({ decisions, tasks, allowedTransition }) => {
    const { optedOut, eligible, bassReferralNeeded, addressUnsuitable } = decisions
    const { eligibility, optOut } = tasks

    const eligibilityDone = eligibility === 'DONE'
    const optOutUnstarted = optOut === 'UNSTARTED'
    const optOutRefused = optOut === 'DONE' && !optedOut

    const context = { decisions, tasks, allowedTransition }

    return tasklist(context, [
      [eligibilityTask, true],
      [informOffenderTask, eligibilityDone && optOutUnstarted && !optedOut],
      [curfewAddress, eligible],
      [riskManagement.edit, addressUnsuitable],
      [caSubmitToDm.refusal, allowedTransition === 'caToDmRefusal'],
      [caSubmitBassReview, optOutRefused && bassReferralNeeded && allowedTransition !== 'caToDmRefusal'],
      [caSubmitAddressReview, optOutRefused && !bassReferralNeeded && allowedTransition !== 'caToDmRefusal'],
    ])
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
    const context = { decisions, tasks, allowedTransition }

    if (optedOut) {
      return tasklist(context, [
        [proposedAddress.ca.processing, !bassReferralNeeded && allowedTransition !== 'caToRo'],
        [curfewAddress, !bassReferralNeeded && allowedTransition === 'caToRo'],
        [bassAddress.ca.postApproval, bassReferralNeeded],
        [hdcRefusal, true],
      ])
    }

    if (!eligible) {
      return tasklist(context, [
        [eligibilityTask, true],
        [informOffenderTask, true],
      ])
    }

    const showRiskManagement =
      (!approvedPremisesRequired && curfewAddressApproved) ||
      addressUnsuitable ||
      (bassChecksDone && !approvedPremisesRequired)

    return tasklist(context, [
      [eligibilityTask, true],
      [proposedAddress.ca.processing, !bassReferralNeeded && allowedTransition !== 'caToRo'],
      [curfewAddress, !bassReferralNeeded && allowedTransition === 'caToRo'],
      [bassAddress.ca.postApproval, bassReferralNeeded],
      [riskManagement.edit, showRiskManagement],
      [victimLiaison.edit, validAddress],
      [curfewHours.edit, validAddress],
      [additionalConditions.edit, validAddress],
      [reportingInstructions.edit, validAddress],
      [finalChecks.review, validAddress],
      [postponeOrRefuse, validAddress],
      [hdcRefusal, true],
      [caSubmitToDm.approval, allowedTransition !== 'caToDmRefusal' && allowedTransition !== 'caToRo'],
      [caSubmitToDm.refusal, allowedTransition === 'caToDmRefusal'],
      [caSubmitAddressReview, !bassReferralNeeded && allowedTransition === 'caToRo'],
      [caSubmitBassReview, bassReferralNeeded && allowedTransition === 'caToRo'],
    ])
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

    const context = { decisions, tasks, stage, allowedTransition }

    if (!eligible) {
      return tasklist(context, [
        [eligibilitySummaryTask, validAddress],
        [invisibleInformOffenderTask, true],
      ])
    }

    return tasklist(context, [
      [eligibilitySummaryTask, validAddress],
      [curfewAddress, allowedTransition === 'caToRo'],
      [bassAddress.ca.standard, bassReferralNeeded && allowedTransition !== 'caToRo'],
      [proposedAddress.ca.postApproval, !bassReferralNeeded && allowedTransition !== 'caToRo'],
      [riskManagement.edit, !approvedPremisesRequired && (curfewAddressApproved || bassOfferMade || addressUnsuitable)],
      [victimLiaison.edit, validAddress],
      [curfewHours.edit, validAddress],
      [additionalConditions.edit, validAddress],
      [reportingInstructions.edit, validAddress],
      [finalChecks.review, validAddress],
      [postponeOrRefuse, validAddress && !dmRefused],
      [hdcRefusal, !dmRefused],
      [caSubmitToDm.approval, allowedTransition === 'caToDm'],
      [caSubmitToDm.refusal, allowedTransition === 'caToDmRefusal'],
      [caSubmitBassReview, allowedTransition === 'caToRo'],
      [caSubmitAddressReview, !bassReferralNeeded && allowedTransition === 'caToRo'],
      [caRereferDm, !['caToDm', 'caToDmRefusal', 'caToRo'].includes(allowedTransition) && dmRefused !== undefined],
      [createLicence, validAddress && !['caToDm', 'caToDmRefusal', 'caToRo'].includes(allowedTransition) && !dmRefused],
    ])
  },
}

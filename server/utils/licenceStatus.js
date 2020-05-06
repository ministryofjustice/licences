const { taskStates, getOverallState } = require('../services/config/taskStates')
const { licenceStages } = require('../services/config/licenceStages')
const { getIn, isEmpty, flatten } = require('./functionalHelpers')

const { getBassAreaState, getBassRequestState, getBassState } = require('./bassAddressState')
const { getCurfewAddressReviewState, getCurfewAddressState } = require('./curfewAddressState')
const { getEligibilityState } = require('./eligibilityState')

module.exports = { getLicenceStatus }

function getLicenceStatus(licenceRecord) {
  if (!licenceRecord || isEmpty(licenceRecord.licence) || !licenceRecord.stage) {
    return {
      stage: licenceStages.UNSTARTED,
      decisions: {},
      tasks: {
        exclusion: taskStates.UNSTARTED,
        crdTime: taskStates.UNSTARTED,
        suitability: taskStates.UNSTARTED,
        eligibility: taskStates.UNSTARTED,
        optOut: taskStates.UNSTARTED,
        curfewAddress: taskStates.UNSTARTED,
        bassRequest: taskStates.UNSTARTED,
        bassAreaCheck: taskStates.UNSTARTED,
        bassOffer: taskStates.UNSTARTED,
        bassAddress: taskStates.UNSTARTED,
        riskManagement: taskStates.UNSTARTED,
        curfewAddressReview: taskStates.UNSTARTED,
        curfewHours: taskStates.UNSTARTED,
        reportingInstructions: taskStates.UNSTARTED,
        licenceConditions: taskStates.UNSTARTED,
        seriousOffenceCheck: taskStates.UNSTARTED,
        onRemandCheck: taskStates.UNSTARTED,
        confiscationOrderCheck: taskStates.UNSTARTED,
        finalChecks: taskStates.UNSTARTED,
        approval: taskStates.UNSTARTED,
        createLicence: taskStates.UNSTARTED,
        approvedPremisesAddress: taskStates.UNSTARTED,
      },
    }
  }
  const { stage } = licenceRecord
  const results = getRequiredState(stage, licenceRecord.licence)
  const postApproval = isPostDecision(stage)
  const createLicence = postApproval ? getLicenceCreatedTaskState(licenceRecord) : taskStates.UNSTARTED
  return results.reduce(combiner, { stage, postApproval, decisions: {}, tasks: { createLicence } })
}

function getRequiredState(stage, licence) {
  const config = {
    [licenceStages.ELIGIBILITY]: [getEligibilityStageState],
    [licenceStages.PROCESSING_RO]: [getEligibilityStageState, getRoStageState],
    [licenceStages.PROCESSING_CA]: [getEligibilityStageState, getRoStageState, getCaStageState],
    [licenceStages.APPROVAL]: [getEligibilityStageState, getRoStageState, getCaStageState, getApprovalStageState],
    [licenceStages.DECIDED]: [getEligibilityStageState, getRoStageState, getCaStageState, getApprovalStageState],
    [licenceStages.MODIFIED]: [getEligibilityStageState, getRoStageState, getCaStageState, getApprovalStageState],
    [licenceStages.MODIFIED_APPROVAL]: [
      getEligibilityStageState,
      getRoStageState,
      getCaStageState,
      getApprovalStageState,
    ],
    [licenceStages.VARY]: [getEligibilityStageState, getRoStageState, getCaStageState, getApprovalStageState],
  }

  return config[stage].map((getStateMethod) => getStateMethod(licence))
}

const combiner = (acc, data) => {
  const combinedTasks = { ...acc.tasks, ...data.tasks }
  const combinedDecisions = { ...acc.decisions, ...data.decisions }

  return {
    ...acc,
    tasks: combinedTasks,
    decisions: combinedDecisions,
  }
}

function getApprovalStageState(licence) {
  const approvalRelease = getIn(licence, ['approval', 'release']) || {}
  const finalChecksRefusal = getIn(licence, ['finalChecks', 'refusal']) || {}

  const dmRefusalReasonText = extractDmRefusalReasonsText(approvalRelease.reason)
  const caRefusalReasonText = extractCaRefusalReasonText(finalChecksRefusal.reason)
  const refusalReason = dmRefusalReasonText || caRefusalReasonText

  const { bassAccepted, bassOffer, bassAddress } = getBassState(licence)

  return {
    decisions: {
      approved: approvalRelease.decision === 'Yes' && finalChecksRefusal.decision !== 'Yes',
      refused: approvalRelease.decision === 'No' || finalChecksRefusal.decision === 'Yes',
      dmRefused: approvalRelease.decision === 'No',
      refusalReason,
      bassAccepted,
      decisionComments: approvalRelease.reasonForDecision ? approvalRelease.reasonForDecision.trim() : null,
    },
    tasks: {
      approval: isEmpty(approvalRelease.decision) ? taskStates.UNSTARTED : taskStates.DONE,
      bassOffer,
      bassAddress,
    },
  }
}

function getRoStageState(licence) {
  const { riskManagementNeeded, riskManagement, awaitingRiskInformation, addressUnsuitable } = getRiskManagementState(
    licence
  )
  const { victim, victimLiaisonNeeded } = getVictimLiaisonState(licence)
  const {
    approvedPremisesRequired,
    approvedPremisesAddress,
    curfewAddressReview,
    curfewAddressApproved,
    addressReviewFailed,
    addressWithdrawn,
  } = getCurfewAddressReviewState(licence)
  const { curfewHours } = getCurfewHoursState(licence)
  const { reportingInstructions } = getReportingInstructionsState(licence)
  const {
    licenceConditions,
    standardOnly,
    additional,
    bespoke,
    bespokeRejected,
    bespokePending,
  } = getLicenceConditionsState(licence)
  const { bassAreaCheck, bassAreaSuitable, bassAreaNotSuitable } = getBassAreaState(licence)

  return {
    decisions: {
      riskManagementNeeded,
      awaitingRiskInformation,
      victimLiaisonNeeded,
      curfewAddressApproved,
      standardOnly,
      additional,
      bespoke,
      bespokeRejected,
      bespokePending,
      bassAreaSuitable,
      bassAreaNotSuitable,
      approvedPremisesRequired,
      addressReviewFailed,
      addressWithdrawn,
      addressUnsuitable,
      curfewAddressRejected: addressUnsuitable || addressReviewFailed,
    },
    tasks: {
      riskManagement,
      victim,
      approvedPremisesAddress,
      curfewAddressReview,
      curfewHours,
      reportingInstructions,
      licenceConditions,
      bassAreaCheck,
    },
  }
}

function getCaStageState(licence) {
  const { seriousOffence, seriousOffenceCheck } = getSeriousOffenceCheckState(licence)
  const { onRemand, onRemandCheck } = getOnRemandCheckState(licence)
  const { confiscationOrder, confiscationOrderCheck } = getConfiscationOrderState(licence)
  const { finalChecksPass, finalChecksRefused, postponed } = getFinalChecksState(licence, seriousOffence, onRemand)
  const finalChecks = getOverallState([seriousOffenceCheck, onRemandCheck, confiscationOrderCheck])
  const { bassAccepted, bassOffer, bassWithdrawn, bassWithdrawalReason } = getBassState(licence)
  const finalChecksRefusal = getIn(licence, ['finalChecks', 'refusal']) || {}
  const refusalReason = extractCaRefusalReasonText(finalChecksRefusal.reason)

  return {
    decisions: {
      seriousOffence,
      onRemand,
      confiscationOrder,
      postponed,
      finalChecksPass,
      finalChecksRefused,
      bassAccepted,
      bassWithdrawn,
      bassWithdrawalReason,
      caRefused: finalChecksRefusal.decision === 'Yes',
      refusalReason,
    },
    tasks: {
      seriousOffenceCheck,
      onRemandCheck,
      confiscationOrderCheck,
      finalChecks,
      bassOffer,
    },
  }
}

function getEligibilityStageState(licence) {
  const eligibilityState = getEligibilityState(licence)

  const { curfewAddressApproved, addressReviewFailed } = getCurfewAddressReviewState(licence)
  const { addressUnsuitable, riskManagement } = getRiskManagementState(licence)
  const curfewAddressRejected = addressUnsuitable || addressReviewFailed
  const { optedOut, optOut } = getOptOutState(licence)
  const { bassReferralNeeded, bassAreaSpecified, bassRequest } = getBassRequestState(licence)
  const { bassAreaSuitable, bassAreaNotSuitable } = getBassAreaState(licence)
  const { curfewAddress, offenderIsMainOccupier } = getCurfewAddressState(
    licence,
    optedOut,
    bassReferralNeeded,
    curfewAddressRejected
  )

  return {
    decisions: {
      ...eligibilityState.decisions,
      optedOut,
      bassReferralNeeded,
      bassAreaSpecified,
      bassAreaSuitable,
      bassAreaNotSuitable,
      curfewAddressApproved,
      offenderIsMainOccupier,
      curfewAddressRejected,
      addressUnsuitable,
    },
    tasks: {
      ...eligibilityState.tasks,
      optOut,
      bassRequest,
      curfewAddress,
      riskManagement,
    },
  }
}

function getOptOutState(licence) {
  const optOutAnswer = getIn(licence, ['proposedAddress', 'optOut', 'decision'])

  return {
    optedOut: optOutAnswer === 'Yes',
    optOut: optOutAnswer ? taskStates.DONE : taskStates.UNSTARTED,
  }
}

function getRiskManagementState(licence) {
  const riskManagementAnswer = getIn(licence, ['risk', 'riskManagement', 'planningActions'])
  const awaitingInformationAnswer = getIn(licence, ['risk', 'riskManagement', 'awaitingInformation'])
  const proposedAddressSuitable = getIn(licence, ['risk', 'riskManagement', 'proposedAddressSuitable'])

  return {
    riskManagementNeeded: riskManagementAnswer === 'Yes',
    proposedAddressSuitable: proposedAddressSuitable === 'Yes',
    awaitingRiskInformation: awaitingInformationAnswer === 'Yes',
    riskManagement: getState(),
    addressUnsuitable: proposedAddressSuitable === 'No',
  }

  function getState() {
    if (!getIn(licence, ['risk', 'riskManagement'])) {
      return taskStates.UNSTARTED
    }

    if (riskManagementAnswer && awaitingInformationAnswer && proposedAddressSuitable) {
      return taskStates.DONE
    }

    return taskStates.STARTED
  }
}

function getVictimLiaisonState(licence) {
  const victimLiaisonAnswer = getIn(licence, ['victim', 'victimLiaison', 'decision'])

  return {
    victimLiaisonNeeded: victimLiaisonAnswer === 'Yes',
    victim: victimLiaisonAnswer ? taskStates.DONE : taskStates.UNSTARTED,
  }
}

function extractDmRefusalReasonsText(reasons) {
  const refusalReasons = {
    addressUnsuitable: 'address unsuitable',
    insufficientTime: 'insufficient time',
    noAvailableAddress: 'no available address',
    outOfTime: 'out of time',
  }
  const reasonsString = flatten([reasons])
    .map((reason) => refusalReasons[reason])
    .join(', ')
  return reasonsString.charAt(0).toUpperCase() + reasonsString.slice(1)
}

function extractCaRefusalReasonText(reason) {
  return {
    addressUnsuitable: 'No available address',
    insufficientTime: 'Out of time',
  }[reason]
}

function getCurfewHoursState(licence) {
  return {
    curfewHours: getIn(licence, ['curfew', 'curfewHours']) ? taskStates.DONE : taskStates.UNSTARTED,
  }
}

function getReportingInstructionsState(licence) {
  return {
    reportingInstructions: getState(),
  }

  function getState() {
    const reportingInstructions = getIn(licence, ['reporting', 'reportingInstructions'])

    if (isEmpty(reportingInstructions)) {
      return taskStates.UNSTARTED
    }

    const required = [
      'name',
      'organisation',
      'buildingAndStreet1',
      'townOrCity',
      'postcode',
      'telephone',
      'reportingDate',
      'reportingTime',
    ]
    if (required.some((field) => isEmpty(getIn(reportingInstructions, [field])))) {
      return taskStates.STARTED
    }

    return taskStates.DONE
  }
}

function getLicenceConditionsState(licence) {
  if (isEmpty(getIn(licence, ['licenceConditions']))) {
    return {
      standardOnly: false,
      additional: 0,
      bespoke: 0,
      bespokeRejected: 0,
      bespokePending: 0,
      totalCount: 0,
      licenceConditions: taskStates.UNSTARTED,
    }
  }

  const standardOnly = getIn(licence, ['licenceConditions', 'standard', 'additionalConditionsRequired']) === 'No'

  const additionals = getIn(licence, ['licenceConditions', 'additional'])
  const bespokes = getIn(licence, ['licenceConditions', 'bespoke'])

  const additional = additionals ? Object.keys(additionals).length : 0
  const bespoke = bespokes ? bespokes.length : 0

  const totalCount = additional + bespoke

  const rejected = bespokes ? bespokes.filter((b) => b.approved === 'No') : 0
  const bespokeRejected = rejected ? rejected.length : 0

  const notAnswered = bespokes ? bespokes.filter((b) => isEmpty(b.approved)) : 0
  const bespokePending = notAnswered ? notAnswered.length : 0

  return {
    standardOnly,
    additional,
    bespoke,
    bespokeRejected,
    bespokePending,
    totalCount,
    licenceConditions: standardOnly || totalCount > 0 ? taskStates.DONE : taskStates.STARTED,
  }
}

function getSeriousOffenceCheckState(licence) {
  const seriousOffenceAnswer = getIn(licence, ['finalChecks', 'seriousOffence', 'decision'])

  return {
    seriousOffence: seriousOffenceAnswer && seriousOffenceAnswer === 'Yes',
    seriousOffenceCheck: seriousOffenceAnswer ? taskStates.DONE : taskStates.UNSTARTED,
  }
}

function getOnRemandCheckState(licence) {
  const onRemandAnswer = getIn(licence, ['finalChecks', 'onRemand', 'decision'])

  return {
    onRemand: onRemandAnswer && onRemandAnswer === 'Yes',
    onRemandCheck: onRemandAnswer ? taskStates.DONE : taskStates.UNSTARTED,
  }
}

function getConfiscationOrderState(licence) {
  const confiscationOrderAnswer = getIn(licence, ['finalChecks', 'confiscationOrder', 'decision'])

  return {
    confiscationOrder: confiscationOrderAnswer && confiscationOrderAnswer === 'Yes',
    confiscationOrderCheck: confiscationOrderAnswer ? taskStates.DONE : taskStates.UNSTARTED,
  }
}

function getFinalChecksState(licence, seriousOffence, onRemand) {
  const finalChecksPass = !(seriousOffence || onRemand)

  const postponed = getIn(licence, ['finalChecks', 'postpone', 'decision']) === 'Yes'
  const finalChecksRefused = getIn(licence, ['finalChecks', 'refusal', 'decision']) === 'Yes'

  return {
    finalChecksPass,
    finalChecksRefused,
    postponed,
  }
}

function isPostDecision(stage) {
  return ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL'].includes(stage)
}

function getLicenceCreatedTaskState(licenceRecord) {
  const approvedVersion = getIn(licenceRecord, ['approved_version'])

  return approvedVersion && licenceRecord.version === approvedVersion ? 'DONE' : 'UNSTARTED'
}

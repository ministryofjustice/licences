import { taskState, getOverallState } from '../services/config/taskState'
import { licenceStages } from '../services/config/licenceStages'
import { getIn, isEmpty, flatten } from './functionalHelpers'

import { getBassAreaState, getBassRequestState, getBassState } from './bassAddressState'
import { getCurfewAddressReviewState, getCurfewAddressState } from './curfewAddressState'
import { getEligibilityState } from './eligibilityState'

export = function getLicenceStatus(licenceRecord) {
  if (!licenceRecord || isEmpty(licenceRecord.licence) || !licenceRecord.stage) {
    return {
      stage: licenceStages.UNSTARTED,
      decisions: {},
      tasks: {
        exclusion: taskState.UNSTARTED,
        crdTime: taskState.UNSTARTED,
        suitability: taskState.UNSTARTED,
        eligibility: taskState.UNSTARTED,
        optOut: taskState.UNSTARTED,
        curfewAddress: taskState.UNSTARTED,
        bassRequest: taskState.UNSTARTED,
        bassAreaCheck: taskState.UNSTARTED,
        bassOffer: taskState.UNSTARTED,
        bassAddress: taskState.UNSTARTED,
        riskManagement: taskState.UNSTARTED,
        curfewAddressReview: taskState.UNSTARTED,
        curfewHours: taskState.UNSTARTED,
        reportingInstructions: taskState.UNSTARTED,
        licenceConditions: taskState.UNSTARTED,
        seriousOffenceCheck: taskState.UNSTARTED,
        onRemandCheck: taskState.UNSTARTED,
        confiscationOrderCheck: taskState.UNSTARTED,
        finalChecks: taskState.UNSTARTED,
        approval: taskState.UNSTARTED,
        createLicence: taskState.UNSTARTED,
        approvedPremisesAddress: taskState.UNSTARTED,
      },
    }
  }
  const { stage } = licenceRecord
  const results = getRequiredState(stage, licenceRecord.licence)
  const initialState = getInitialState(stage, licenceRecord)
  return results.reduce(combiner, initialState)
}

const getInitialState = (stage, licenceRecord) => {
  const { licence } = licenceRecord
  const eligibilityState = getEligibilityState(licence)

  const postApproval = isPostDecision(stage)

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
    stage,
    postApproval,
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
      createLicence: postApproval ? getLicenceCreatedTaskState(licenceRecord) : taskState.UNSTARTED,
      ...eligibilityState.tasks,
      optOut,
      bassRequest,
      curfewAddress,
      riskManagement,
    },
  }
}

function getRequiredState(stage, licence) {
  const config = {
    [licenceStages.ELIGIBILITY]: [],
    [licenceStages.PROCESSING_RO]: [getRoStageState],
    [licenceStages.PROCESSING_CA]: [getRoStageState, getCaStageState],
    [licenceStages.APPROVAL]: [getRoStageState, getCaStageState, getApprovalStageState],
    [licenceStages.DECIDED]: [getRoStageState, getCaStageState, getApprovalStageState],
    [licenceStages.MODIFIED]: [getRoStageState, getCaStageState, getApprovalStageState],
    [licenceStages.MODIFIED_APPROVAL]: [getRoStageState, getCaStageState, getApprovalStageState],
    [licenceStages.VARY]: [getRoStageState, getCaStageState, getApprovalStageState],
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
      approval: isEmpty(approvalRelease.decision) ? taskState.UNSTARTED : taskState.DONE,
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

function getOptOutState(licence) {
  const optOutAnswer = getIn(licence, ['proposedAddress', 'optOut', 'decision'])

  return {
    optedOut: optOutAnswer === 'Yes',
    optOut: optOutAnswer ? taskState.DONE : taskState.UNSTARTED,
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
      return taskState.UNSTARTED
    }

    if (riskManagementAnswer && awaitingInformationAnswer && proposedAddressSuitable) {
      return taskState.DONE
    }

    return taskState.STARTED
  }
}

function getVictimLiaisonState(licence) {
  const victimLiaisonAnswer = getIn(licence, ['victim', 'victimLiaison', 'decision'])

  return {
    victimLiaisonNeeded: victimLiaisonAnswer === 'Yes',
    victim: victimLiaisonAnswer ? taskState.DONE : taskState.UNSTARTED,
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
    curfewHours: getIn(licence, ['curfew', 'curfewHours']) ? taskState.DONE : taskState.UNSTARTED,
  }
}

function getReportingInstructionsState(licence) {
  return {
    reportingInstructions: getState(),
  }

  function getState() {
    const reportingInstructions = getIn(licence, ['reporting', 'reportingInstructions'])

    if (isEmpty(reportingInstructions)) {
      return taskState.UNSTARTED
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
      return taskState.STARTED
    }

    return taskState.DONE
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
      licenceConditions: taskState.UNSTARTED,
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
    licenceConditions: standardOnly || totalCount > 0 ? taskState.DONE : taskState.STARTED,
  }
}

function getSeriousOffenceCheckState(licence) {
  const seriousOffenceAnswer = getIn(licence, ['finalChecks', 'seriousOffence', 'decision'])

  return {
    seriousOffence: seriousOffenceAnswer && seriousOffenceAnswer === 'Yes',
    seriousOffenceCheck: seriousOffenceAnswer ? taskState.DONE : taskState.UNSTARTED,
  }
}

function getOnRemandCheckState(licence) {
  const onRemandAnswer = getIn(licence, ['finalChecks', 'onRemand', 'decision'])

  return {
    onRemand: onRemandAnswer && onRemandAnswer === 'Yes',
    onRemandCheck: onRemandAnswer ? taskState.DONE : taskState.UNSTARTED,
  }
}

function getConfiscationOrderState(licence) {
  const confiscationOrderAnswer = getIn(licence, ['finalChecks', 'confiscationOrder', 'decision'])

  return {
    confiscationOrder: confiscationOrderAnswer && confiscationOrderAnswer === 'Yes',
    confiscationOrderCheck: confiscationOrderAnswer ? taskState.DONE : taskState.UNSTARTED,
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

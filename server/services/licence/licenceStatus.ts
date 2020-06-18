import { taskState, getOverallState } from '../config/taskState'
import { licenceStage, isPostApproval } from '../config/licenceStage'
import { isEmpty, flatten } from '../../utils/functionalHelpers'

import { getBassAreaState, getBassRequestState, getBassState } from './bassAddressState'
import { getCurfewAddressReviewState, getCurfewAddressState } from './curfewAddressState'
import { getEligibilityState } from './eligibilityState'
import { LicenceStatus } from './licenceStatusTypes'

export = function getLicenceStatus(licenceRecord): LicenceStatus {
  if (!licenceRecord || isEmpty(licenceRecord.licence) || !licenceRecord.stage) {
    return {
      stage: licenceStage.UNSTARTED,
      postApproval: false,
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
        victim: taskState.UNSTARTED,
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

  const postApproval = isPostApproval(stage)

  const { curfewAddressApproved, addressReviewFailed } = getCurfewAddressReviewState(licence)
  const { addressUnsuitable, riskManagement } = getRiskManagementState(licence)
  const curfewAddressRejected = addressUnsuitable || addressReviewFailed
  const { decision: optedOut, task: optOut } = getTaskState(licence.proposedAddress?.optOut?.decision)
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
    [licenceStage.ELIGIBILITY]: [],
    [licenceStage.PROCESSING_RO]: [getRoStageState],
    [licenceStage.PROCESSING_CA]: [getRoStageState, getCaStageState],
    [licenceStage.APPROVAL]: [getRoStageState, getCaStageState, getApprovalStageState],
    [licenceStage.DECIDED]: [getRoStageState, getCaStageState, getApprovalStageState],
    [licenceStage.MODIFIED]: [getRoStageState, getCaStageState, getApprovalStageState],
    [licenceStage.MODIFIED_APPROVAL]: [getRoStageState, getCaStageState, getApprovalStageState],
    [licenceStage.VARY]: [getRoStageState, getCaStageState, getApprovalStageState],
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
  const approvalRelease = licence.approval?.release || {}
  const finalChecksRefusal = licence.finalChecks?.refusal || {}

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
  const { riskManagementNeeded, awaitingRiskInformation } = getRiskManagementState(licence)
  const { decision: victimLiaisonNeeded, task: victim } = getTaskState(licence.victim?.victimLiaison?.decision)
  const {
    approvedPremisesRequired,
    approvedPremisesAddress,
    curfewAddressReview,
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
  const { bassAreaCheck } = getBassAreaState(licence)

  return {
    decisions: {
      riskManagementNeeded,
      awaitingRiskInformation,
      victimLiaisonNeeded,
      standardOnly,
      additional,
      bespoke,
      bespokeRejected,
      bespokePending,
      approvedPremisesRequired,
      addressReviewFailed,
      addressWithdrawn,
    },
    tasks: {
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
  const { finalChecks } = licence

  const { decision: seriousOffence, task: seriousOffenceCheck } = getTaskState(finalChecks?.seriousOffence?.decision)
  const { decision: onRemand, task: onRemandCheck } = getTaskState(finalChecks?.onRemand?.decision)
  const { decision: confiscationOrder, task: confiscationOrderCheck } = getTaskState(
    finalChecks?.confiscationOrder?.decision
  )

  const { finalChecksPass, finalChecksRefused, postponed } = getFinalChecksState(licence, seriousOffence, onRemand)
  const { bassAccepted, bassOffer, bassWithdrawn, bassWithdrawalReason } = getBassState(licence)
  const finalChecksRefusal = finalChecks?.refusal || {}
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
      finalChecks: getOverallState([seriousOffenceCheck, onRemandCheck, confiscationOrderCheck]),
      bassOffer,
    },
  }
}

function getRiskManagementState(licence) {
  const riskManagement = licence.risk?.riskManagement
  const riskManagementAnswer = riskManagement?.planningActions
  const awaitingInformationAnswer = riskManagement?.awaitingInformation
  const { proposedAddressSuitable } = riskManagement || {}

  return {
    riskManagementNeeded: riskManagementAnswer === 'Yes',
    proposedAddressSuitable: proposedAddressSuitable === 'Yes',
    awaitingRiskInformation: awaitingInformationAnswer === 'Yes',
    riskManagement: getState(),
    addressUnsuitable: proposedAddressSuitable === 'No',
  }

  function getState() {
    if (!riskManagement) {
      return taskState.UNSTARTED
    }

    if (riskManagementAnswer && awaitingInformationAnswer && proposedAddressSuitable) {
      return taskState.DONE
    }

    return taskState.STARTED
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
    curfewHours: licence.curfew?.curfewHours ? taskState.DONE : taskState.UNSTARTED,
  }
}

function getReportingInstructionsState(licence) {
  return {
    reportingInstructions: getState(),
  }

  function getState() {
    const reportingInstructions = licence.reporting?.reportingInstructions

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
    if (required.some((field) => isEmpty(reportingInstructions && reportingInstructions[field]))) {
      return taskState.STARTED
    }

    return taskState.DONE
  }
}

function getLicenceConditionsState(licence) {
  if (isEmpty(licence.licenceConditions)) {
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

  const standardOnly = licence.licenceConditions?.standard?.additionalConditionsRequired === 'No'

  const additionals = licence.licenceConditions?.additional
  const bespokes = licence.licenceConditions?.bespoke

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

const getTaskState = (answer: any) => ({
  decision: answer === 'Yes',
  task: answer ? taskState.DONE : taskState.UNSTARTED,
})

function getFinalChecksState(licence, seriousOffence, onRemand) {
  const finalChecksPass = !(seriousOffence || onRemand)

  const postponed = licence.finalChecks?.postpone?.decision === 'Yes'
  const finalChecksRefused = licence.finalChecks?.refusal?.decision === 'Yes'

  return {
    finalChecksPass,
    finalChecksRefused,
    postponed,
  }
}

function getLicenceCreatedTaskState(licenceRecord) {
  const approvedVersion = licenceRecord.approved_version

  return approvedVersion && licenceRecord.version === approvedVersion ? taskState.DONE : taskState.UNSTARTED
}

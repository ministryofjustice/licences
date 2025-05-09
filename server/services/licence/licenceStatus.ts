import { TaskState, getOverallState } from '../config/taskState'
import { isPostApproval } from '../config/licenceStage'
import { isEmpty, flatten } from '../../utils/functionalHelpers'

import { getBassAreaState, getBassRequestState, getBassState } from './bassAddressState'
import { getCurfewAddressReviewState, getCurfewAddressState } from './curfewAddressState'
import { getEligibilityState } from './eligibilityState'
import { LicenceStatus } from './licenceStatusTypes'
import { LicenceStage } from '../../data/licenceTypes'

export = function getLicenceStatus(licenceRecord): LicenceStatus {
  if (!licenceRecord || isEmpty(licenceRecord.licence) || !licenceRecord.stage) {
    return {
      stage: LicenceStage.UNSTARTED,
      postApproval: false,
      decisions: {},
      tasks: {
        exclusion: TaskState.UNSTARTED,
        crdTime: TaskState.UNSTARTED,
        suitability: TaskState.UNSTARTED,
        eligibility: TaskState.UNSTARTED,
        optOut: TaskState.UNSTARTED,
        curfewAddress: TaskState.UNSTARTED,
        bassRequest: TaskState.UNSTARTED,
        bassAreaCheck: TaskState.UNSTARTED,
        bassOffer: TaskState.UNSTARTED,
        bassAddress: TaskState.UNSTARTED,
        riskManagement: TaskState.UNSTARTED,
        curfewAddressReview: TaskState.UNSTARTED,
        curfewHours: TaskState.UNSTARTED,
        reportingInstructions: TaskState.UNSTARTED,
        licenceConditions: TaskState.UNSTARTED,
        seriousOffenceCheck: TaskState.UNSTARTED,
        onRemandCheck: TaskState.UNSTARTED,
        confiscationOrderCheck: TaskState.UNSTARTED,
        undulyLenientSentenceCheck: TaskState.UNSTARTED,
        segregationCheck: TaskState.UNSTARTED,
        finalChecks: TaskState.UNSTARTED,
        approval: TaskState.UNSTARTED,
        createLicence: TaskState.UNSTARTED,
        approvedPremisesAddress: TaskState.UNSTARTED,
        victim: TaskState.UNSTARTED,
      },
    }
  }
  const { stage, licenceInCvl } = licenceRecord
  const results = getRequiredState(stage, licenceRecord.licence, licenceInCvl)
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
      createLicence: postApproval ? getLicenceCreatedTaskState(licenceRecord) : TaskState.UNSTARTED,
      ...eligibilityState.tasks,
      optOut,
      bassRequest,
      curfewAddress,
      riskManagement,
    },
  }
}

function getRequiredState(stage, licence, licenceInCvl) {
  const config = {
    [LicenceStage.ELIGIBILITY]: [],
    [LicenceStage.PROCESSING_RO]: [getRoStageState],
    [LicenceStage.PROCESSING_CA]: [getRoStageState, getCaStageState],
    [LicenceStage.APPROVAL]: [getRoStageState, getCaStageState, getApprovalStageState],
    [LicenceStage.DECIDED]: [getRoStageState, getCaStageState, getApprovalStageState],
    [LicenceStage.MODIFIED]: [getRoStageState, getCaStageState, getApprovalStageState],
    [LicenceStage.MODIFIED_APPROVAL]: [getRoStageState, getCaStageState, getApprovalStageState],
    [LicenceStage.VARY]: [getRoStageState, getCaStageState, getApprovalStageState],
  }

  return config[stage].map((getStateMethod) => getStateMethod(licence, licenceInCvl))
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

function getApprovalStageState(licence, licenceInCvl) {
  const approvalRelease = licence.approval?.release || {}
  const dmConsideration = licence.approval?.consideration || {}

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
      dmNotConsidered: dmConsideration.decision === 'No',
      refusalReason,
      bassAccepted,
      useCvlForLicenceCreation: licenceInCvl,
      decisionComments: approvalRelease.reasonForDecision ? approvalRelease.reasonForDecision.trim() : null,
    },
    tasks: {
      approval: isEmpty(approvalRelease.decision) ? TaskState.UNSTARTED : TaskState.DONE,
      bassOffer,
      bassAddress,
    },
  }
}

function getRoStageState(licence) {
  const {
    riskManagementNeeded,
    awaitingRiskInformation,
    showMandatoryAddressChecksNotCompletedWarning,
    pomNotConsulted,
    prisonHealthcareNotConsulted,
    riskManagementVersion,
  } = getRiskManagementState(licence)
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
  const { licenceConditions, standardOnly, additional, bespoke, bespokeRejected, bespokePending } =
    getLicenceConditionsState(licence)
  const { bassAreaCheck } = getBassAreaState(licence)

  return {
    decisions: {
      riskManagementVersion,
      riskManagementNeeded,
      awaitingRiskInformation,
      showMandatoryAddressChecksNotCompletedWarning,
      pomNotConsulted,
      prisonHealthcareNotConsulted,
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
  const { decision: undulyLenientSentence, task: undulyLenientSentenceCheck } = getTaskState(
    finalChecks?.undulyLenientSentence?.decision
  )
  const { decision: segregation, task: segregationCheck } = getTaskState(finalChecks?.segregation?.decision)

  const { finalChecksPass, finalChecksRefused, postponed } = getFinalChecksState(licence, seriousOffence, onRemand)
  const { bassAccepted, bassOffer, bassWithdrawn, bassWithdrawalReason } = getBassState(licence)
  const finalChecksRefusal = finalChecks?.refusal || {}
  const refusalReason = extractCaRefusalReasonText(finalChecksRefusal.reason)

  return {
    decisions: {
      seriousOffence,
      onRemand,
      confiscationOrder,
      undulyLenientSentence,
      segregation,
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
      undulyLenientSentenceCheck,
      segregationCheck,
      finalChecks: getOverallState([
        seriousOffenceCheck,
        onRemandCheck,
        confiscationOrderCheck,
        undulyLenientSentenceCheck,
        segregationCheck,
      ]),
      bassOffer,
    },
  }
}

function getRiskManagementState(licence) {
  const riskManagement = licence.risk?.riskManagement
  const riskManagementVersion = riskManagement?.version
  const riskManagementAnswer = riskManagement?.planningActions
  const checksConsideredAnswer = riskManagement?.hasConsideredChecks
  const awaitingInformationAnswer = riskManagement?.awaitingInformation || riskManagement?.awaitingOtherInformation
  const manageInTheCommunityAnswer = riskManagement?.manageInTheCommunity
  const pomConsultationAnswer = riskManagement?.pomConsultation
  const mentalHealthPlanAnswer = riskManagement?.mentalHealthPlan
  const {
    proposedAddressSuitable,
    manageInTheCommunity,
    pomConsultation,
    mentalHealthPlan,
    prisonHealthcareConsultation,
  } = riskManagement || {}
  const { bassRequested } = getBassRequestState(licence)

  return {
    riskManagementVersion,
    riskManagementNeeded: riskManagementAnswer === 'Yes',
    showMandatoryAddressChecksNotCompletedWarning:
      (riskManagementVersion === '2' || riskManagementVersion === '3') &&
      checksConsideredAnswer !== 'Yes' &&
      !bassRequested,
    proposedAddressSuitable:
      proposedAddressSuitable === 'Yes' || (riskManagementVersion === '3' && manageInTheCommunity === 'Yes'),
    awaitingRiskInformation: awaitingInformationAnswer === 'Yes',
    riskManagement: getState(),
    addressUnsuitable:
      proposedAddressSuitable === 'No' || (riskManagementVersion === '3' && manageInTheCommunity === 'No'),
    pomNotConsulted: pomConsultation === 'No',
    prisonHealthcareNotConsulted: mentalHealthPlan === 'Yes' && prisonHealthcareConsultation === 'No',
  }

  function getState() {
    if (!riskManagement) {
      return TaskState.UNSTARTED
    }

    if (
      (riskManagementVersion !== '3' &&
        (riskManagementAnswer || checksConsideredAnswer === 'Yes') &&
        awaitingInformationAnswer &&
        proposedAddressSuitable) ||
      (riskManagementVersion === '3' &&
        (riskManagementAnswer || checksConsideredAnswer === 'Yes') &&
        awaitingInformationAnswer &&
        proposedAddressSuitable &&
        manageInTheCommunityAnswer &&
        pomConsultationAnswer &&
        (mentalHealthPlanAnswer === 'No' || (mentalHealthPlanAnswer && prisonHealthcareConsultation))) ||
      (riskManagementVersion === '2' &&
        checksConsideredAnswer === 'No' &&
        awaitingInformationAnswer &&
        proposedAddressSuitable &&
        bassRequested)
    ) {
      return TaskState.DONE
    }

    return TaskState.STARTED
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
    curfewHours: licence.curfew?.curfewHours ? TaskState.DONE : TaskState.UNSTARTED,
  }
}

function getReportingInstructionsState(licence) {
  return {
    reportingInstructions: getState(),
  }

  function getState() {
    const reportingInstructions = licence.reporting?.reportingInstructions

    if (isEmpty(reportingInstructions)) {
      return TaskState.UNSTARTED
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
      return TaskState.STARTED
    }

    return TaskState.DONE
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
      licenceConditions: TaskState.UNSTARTED,
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
    licenceConditions: standardOnly || totalCount > 0 ? TaskState.DONE : TaskState.STARTED,
  }
}

const getTaskState = (answer: any) => {
  let decision

  if (answer === 'Yes') {
    decision = true
  } else if (answer === 'No') {
    decision = false
  } else decision = undefined

  return {
    decision,
    task: answer ? TaskState.DONE : TaskState.UNSTARTED,
  }
}

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

  return approvedVersion && licenceRecord.version === approvedVersion ? TaskState.DONE : TaskState.UNSTARTED
}

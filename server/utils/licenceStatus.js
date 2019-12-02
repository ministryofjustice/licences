const { taskStates } = require('../services/config/taskStates')
const { licenceStages } = require('../services/config/licenceStages')
const { getIn, isEmpty, lastItem, flatten } = require('./functionalHelpers')
const { isAcceptedAddress } = require('../utils/addressHelpers')

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

  return config[stage].map(getStateMethod => getStateMethod(licence))
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
  const {
    approved,
    refused,
    dmRefused,
    approval,
    refusalReason,
    bassOffer,
    bassAccepted,
    bassAddress,
  } = getApprovalState(licence)

  return {
    decisions: {
      approved,
      refused,
      dmRefused,
      refusalReason,
      bassAccepted,
    },
    tasks: {
      approval,
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
  const { exclusion, excluded } = getExclusionState(licence)
  const { crdTime, insufficientTime, insufficientTimeContinue, insufficientTimeStop } = getCrdTimeState(licence)
  const { suitability, unsuitable, unsuitableResult, exceptionalCircumstances } = getSuitabilityState(licence)

  const notEligible = excluded || insufficientTimeStop || unsuitableResult
  const { eligibility, eligible } = getEligibilityState(notEligible, [exclusion, crdTime, suitability])

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
      exceptionalCircumstances,
      excluded,
      insufficientTime,
      insufficientTimeContinue,
      insufficientTimeStop,
      unsuitable,
      unsuitableResult,
      eligible,
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
      exclusion,
      crdTime,
      suitability,
      eligibility,
      optOut,
      bassRequest,
      curfewAddress,
      riskManagement,
    },
  }
}

function getEligibilityState(notEligible, eligibilityTasks) {
  const eligibility = notEligible ? taskStates.DONE : getOverallState(eligibilityTasks)

  // some things mean not eligible no matter what else, but we only know definitely eligible when all answers complete
  const eligible = notEligible ? false : eligibility === taskStates.DONE

  return {
    eligibility,
    eligible,
  }
}

function getExclusionState(licence) {
  const excludedAnswer = getIn(licence, ['eligibility', 'excluded', 'decision'])

  return {
    excluded: excludedAnswer === 'Yes',
    exclusion: excludedAnswer ? taskStates.DONE : taskStates.UNSTARTED,
  }
}

function getCrdTimeState(licence) {
  const decision = getIn(licence, ['eligibility', 'crdTime', 'decision'])
  const dmApproval = getIn(licence, ['eligibility', 'crdTime', 'dmApproval'])

  return {
    insufficientTimeContinue: decision === 'Yes' && dmApproval === 'Yes',
    insufficientTimeStop: decision === 'Yes' && dmApproval === 'No',
    insufficientTime: decision === 'Yes',
    crdTime: getState(),
  }

  function getState() {
    if (isEmpty(getIn(licence, ['eligibility', 'crdTime']))) {
      return taskStates.UNSTARTED
    }

    if (decision === 'No') {
      return taskStates.DONE
    }

    if (isEmpty(dmApproval)) {
      return taskStates.STARTED
    }

    return taskStates.DONE
  }
}

function getSuitabilityState(licence) {
  const unsuitableAnswer = getIn(licence, ['eligibility', 'suitability', 'decision'])
  const exceptionalCircumstances = getIn(licence, ['eligibility', 'exceptionalCircumstances', 'decision'])

  return {
    unsuitable: unsuitableAnswer === 'Yes',
    exceptionalCircumstances: exceptionalCircumstances === 'Yes',
    unsuitableResult: unsuitableAnswer === 'Yes' && exceptionalCircumstances === 'No',
    suitability: getState(),
  }

  function getState() {
    if (!unsuitableAnswer) {
      return taskStates.UNSTARTED
    }

    if (unsuitableAnswer === 'No') {
      return taskStates.DONE
    }

    if (exceptionalCircumstances) {
      return taskStates.DONE
    }

    return taskStates.STARTED
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

function getApprovalState(licence) {
  const dmApproval = getDmApproval(licence)
  const caRefusal = getCaRefusal(licence)
  const { bassAccepted, bassOffer, bassAddress } = getBassState(licence)

  return {
    approved: dmApproval.approved && !caRefusal.refused,
    refused: dmApproval.refused || caRefusal.refused,
    approval: dmApproval.approval,
    dmRefused: dmApproval.refused,
    refusalReason: dmApproval.refusalReason || caRefusal.refusalReason,
    bassAccepted,
    bassOffer,
    bassAddress,
  }
}

function getDmApproval(licence) {
  const refusalReasons = {
    addressUnsuitable: 'address unsuitable',
    insufficientTime: 'insufficient time',
    noAvailableAddress: 'no available address',
    outOfTime: 'out of time',
  }

  const decision = getIn(licence, ['approval', 'release', 'decision'])
  const reasons = flatten([getIn(licence, ['approval', 'release', 'reason'])])
    .map(reason => refusalReasons[reason])
    .join(', ')

  return {
    approved: decision === 'Yes',
    refused: decision === 'No',
    refusalReason: reasons.charAt(0).toUpperCase() + reasons.slice(1),
    approval: isEmpty(decision) ? taskStates.UNSTARTED : taskStates.DONE,
  }
}

function getCaRefusal(licence) {
  const refusalReasons = {
    addressUnsuitable: 'No available address',
    insufficientTime: 'Out of time',
  }

  const finalChecksRefused = getIn(licence, ['finalChecks', 'refusal', 'decision'])
  const finalChecksRefusalReason = getIn(licence, ['finalChecks', 'refusal', 'reason'])

  return {
    refused: finalChecksRefused === 'Yes',
    refusalReason: refusalReasons[finalChecksRefusalReason],
  }
}

function getCurfewAddressState(licence, optedOut, bassReferralNeeded, curfewAddressRejected) {
  const address = getIn(licence, ['proposedAddress', 'curfewAddress']) || {}

  return {
    offenderIsMainOccupier: getIn(address, ['occupier', 'isOffender']) === 'Yes',
    curfewAddress: getAddressState(),
  }

  function getAddressState() {
    if (optedOut || bassReferralNeeded) {
      return taskStates.DONE
    }

    if (isEmpty(address)) {
      return taskStates.UNSTARTED
    }

    if (curfewAddressRejected) {
      return taskStates.STARTED
    }

    const required = ['cautionedAgainstResident', 'addressLine1', 'addressTown', 'postCode']

    if (required.some(field => !address[field])) {
      return taskStates.STARTED
    }

    const offenderIsMainOccupier = getIn(address, ['occupier', 'isOffender']) === 'Yes'

    if (!offenderIsMainOccupier && !address.telephone) {
      return taskStates.STARTED
    }

    return taskStates.DONE
  }
}

const approvedPremisesAddressState = licence => {
  const approvedPremisesAddressAnswer =
    getIn(licence, ['curfew', 'approvedPremisesAddress']) ||
    getIn(licence, ['bassReferral', 'approvedPremisesAddress']) ||
    {}
  if (isEmpty(approvedPremisesAddressAnswer)) {
    return taskStates.UNSTARTED
  }

  if (
    approvedPremisesAddressAnswer.addressLine1 &&
    approvedPremisesAddressAnswer.addressTown &&
    approvedPremisesAddressAnswer.postCode
  ) {
    return taskStates.DONE
  }

  return taskStates.STARTED
}

const taskCompletion = licence => {
  const { consent, electricity } = getIn(licence, ['curfew', 'curfewAddressReview']) || {}
  const curfewAddress = getIn(licence, ['proposedAddress', 'curfewAddress']) || {}
  const offenderIsOccupier = getIn(curfewAddress, ['occupier', 'isOffender']) === 'Yes'

  if (offenderIsOccupier && electricity) {
    return taskStates.DONE
  }
  if (consent && electricity) {
    return taskStates.DONE
  }
  if (consent || electricity) {
    return taskStates.STARTED
  }
  return taskStates.UNSTARTED
}

function getCurfewAddressReviewState(licence) {
  const approvedPremisesRequiredAnswer =
    getIn(licence, ['curfew', 'approvedPremises', 'required']) ||
    getIn(licence, ['bassReferral', 'bassAreaCheck', 'approvedPremisesRequiredYesNo']) ||
    {}

  if (approvedPremisesRequiredAnswer === 'Yes') {
    const approvedAddressTaskState = approvedPremisesAddressState(licence)
    return {
      approvedPremisesRequired: true,
      approvedPremisesAddress: approvedAddressTaskState,
      curfewAddressReview: approvedAddressTaskState,
      curfewAddressApproved: false,
      addressReviewFailed: false,
      addressWithdrawn: false,
    }
  }

  const addressReview = getIn(licence, ['curfew', 'curfewAddressReview']) || {}
  const rejectedAddresses = getIn(licence, ['proposedAddress', 'rejections'])
  const curfewAddress = getIn(licence, ['proposedAddress', 'curfewAddress']) || {}
  const addressSuitable = getIn(licence, ['risk', 'riskManagement', 'proposedAddressSuitable'])
  const offenderIsOccupier = getIn(curfewAddress, ['occupier', 'isOffender']) === 'Yes'

  return {
    approvedPremisesRequired: false,
    approvedPremisesAddress: taskStates.UNSTARTED,
    curfewAddressReview: taskCompletion(licence),
    curfewAddressApproved: isAcceptedAddress(addressReview, addressSuitable, offenderIsOccupier),
    addressReviewFailed: addressReview.consent === 'No' || addressReview.electricity === 'No',
    addressWithdrawn: isEmpty(curfewAddress) && rejectedAddresses && rejectedAddresses.length > 0,
  }
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
    if (required.some(field => isEmpty(getIn(reportingInstructions, [field])))) {
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

  const rejected = bespokes ? bespokes.filter(b => b.approved === 'No') : 0
  const bespokeRejected = rejected ? rejected.length : 0

  const notAnswered = bespokes ? bespokes.filter(b => isEmpty(b.approved)) : 0
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

function getOverallState(tasks) {
  if (tasks.every(it => it === taskStates.UNSTARTED)) {
    return taskStates.UNSTARTED
  }

  if (tasks.every(it => it === taskStates.DONE)) {
    return taskStates.DONE
  }

  return taskStates.STARTED
}

function isPostDecision(stage) {
  return ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL'].includes(stage)
}

function getLicenceCreatedTaskState(licenceRecord) {
  const approvedVersion = getIn(licenceRecord, ['approved_version'])

  return approvedVersion && licenceRecord.version === approvedVersion ? 'DONE' : 'UNSTARTED'
}

function getBassRequestState(licence) {
  const bassRequestAnswer = getIn(licence, ['bassReferral', 'bassRequest', 'bassRequested'])
  const addressProposedAnswer = getIn(licence, ['proposedAddress', 'addressProposed', 'decision'])

  const bassReferralNeeded = bassRequestAnswer === 'Yes' && addressProposedAnswer === 'No'
  const bassAreaSpecified = getIn(licence, ['bassReferral', 'bassRequest', 'specificArea']) !== 'No'
  const bassRequest = getState()

  return {
    bassReferralNeeded,
    bassAreaSpecified,
    bassRequest,
  }

  function getState() {
    if (bassReferralNeeded && bassAreaSpecified) {
      const bassRequestTown = getIn(licence, ['bassReferral', 'bassRequest', 'proposedTown'])
      const bassRequestCounty = getIn(licence, ['bassReferral', 'bassRequest', 'proposedCounty'])

      if (bassRequestTown && bassRequestCounty) {
        return taskStates.DONE
      }

      if (bassRequestTown || bassRequestCounty) {
        return taskStates.STARTED
      }

      return taskStates.UNSTARTED
    }

    return bassRequestAnswer ? taskStates.DONE : taskStates.UNSTARTED
  }
}

function getBassWithdrawalState(licence) {
  const { bassAreaCheck } = getBassAreaState(licence)
  if (bassAreaCheck === taskStates.DONE) {
    return { bassWithdrawn: false }
  }

  const { bassRequest } = getBassRequestState(licence)
  if (bassRequest === taskStates.DONE || bassRequest === taskStates.STARTED) {
    return { bassWithdrawn: false }
  }
  const bassRejections = getIn(licence, ['bassRejections'])
  const bassWithdrawalReason = isEmpty(bassRejections) ? undefined : lastItem(bassRejections).withdrawal
  const bassWithdrawn = !isEmpty(bassRejections) && !isEmpty(lastItem(bassRejections).withdrawal)

  return { bassWithdrawn, bassWithdrawalReason }
}

function getBassAreaState(licence) {
  const specificArea = getIn(licence, ['bassReferral', 'bassRequest', 'specificArea'])

  if (specificArea === 'No') {
    const seen = getIn(licence, ['bassReferral', 'bassAreaCheck', 'bassAreaCheckSeen'])
    return {
      bassAreaCheck: seen ? taskStates.DONE : taskStates.UNSTARTED,
    }
  }

  const bassAreaSuitableAnswer = getIn(licence, ['bassReferral', 'bassAreaCheck', 'bassAreaSuitable'])
  const bassAreaReason = getIn(licence, ['bassReferral', 'bassAreaCheck', 'bassAreaReason'])

  const bassAreaSuitable = bassAreaSuitableAnswer && bassAreaSuitableAnswer === 'Yes'
  const bassAreaNotSuitable = bassAreaSuitableAnswer && bassAreaSuitableAnswer === 'No'
  const bassAreaCheck = getBassAreaCheckState(bassAreaSuitableAnswer, bassAreaReason)

  return {
    bassAreaSuitable,
    bassAreaNotSuitable,
    bassAreaCheck,
  }
}

function getBassAreaCheckState(bassAreaSuitableAnswer, bassAreaReason) {
  if (!bassAreaSuitableAnswer) {
    return taskStates.UNSTARTED
  }

  if (bassAreaSuitableAnswer === 'No' && !bassAreaReason) {
    return taskStates.STARTED
  }

  return taskStates.DONE
}

function getBassState(licence) {
  const bassAccepted = getIn(licence, ['bassReferral', 'bassOffer', 'bassAccepted'])
  const bassOffer = getBassOfferState(licence, bassAccepted)
  const { bassWithdrawn, bassWithdrawalReason } = getBassWithdrawalState(licence)
  const bassAddress = getBassAddressState(licence)

  return { bassAccepted, bassOffer, bassWithdrawn, bassWithdrawalReason, bassAddress }
}

function getBassOfferState(licence, bassAccepted) {
  if (!bassAccepted) {
    return taskStates.UNSTARTED
  }

  if (bassAccepted) {
    return taskStates.DONE
  }
}

function getBassAddressState(licence) {
  const bassOffer = getIn(licence, ['bassReferral', 'bassOffer'])

  if (!bassOffer) {
    return taskStates.UNSTARTED
  }

  if (bassOffer.bassAccepted === 'Yes') {
    const required = ['addressTown', 'addressLine1', 'postCode']
    if (required.some(field => !bassOffer[field])) {
      return taskStates.STARTED
    }
  }

  return taskStates.DONE
}

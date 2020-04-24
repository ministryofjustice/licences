const { tasklist, namedTask } = require('./tasklistBuilder')
const { postpone } = require('./tasks/postponement')
const bassAddress = require('./tasks/bassAddress')
const proposedAddress = require('./tasks/proposedAddress')
const riskManagement = require('./tasks/riskManagement')
const victimLiaison = require('./tasks/victimLiaison')
const curfewHours = require('./tasks/curfewHours')
const additionalConditions = require('./tasks/additionalConditions')
const reportingInstructions = require('./tasks/reportingInstructions')
const finalChecks = require('./tasks/finalChecks')
const finalDecision = require('./tasks/finalDecision')
const returnToPrisonCaseAdmin = require('./tasks/returnToPrisonCaseAdmin')

const eligibilitySummaryTask = namedTask('eligibilitySummaryTask')

const rejectedAddressTaskList = (licenceStatus) => {
  const { decisions } = licenceStatus
  const showRiskManagement = !(decisions.addressReviewFailed || decisions.addressWithdrawn)
  return tasklist(licenceStatus, [
    [eligibilitySummaryTask, true],
    [proposedAddress.dm.rejected, true],
    [riskManagement.view, showRiskManagement],
    [returnToPrisonCaseAdmin, true],
    [finalDecision.refusal, true],
  ])
}

const insufficientTimeStopTaskList = (licenceStatus) =>
  tasklist(licenceStatus, [
    [eligibilitySummaryTask, true],
    [finalDecision.refusal, true],
  ])

const standardTaskList = (licenceStatus) => {
  const {
    decisions: { approvedPremisesRequired, bassReferralNeeded, confiscationOrder },
  } = licenceStatus
  return tasklist(licenceStatus, [
    [bassAddress.view, bassReferralNeeded],
    [proposedAddress.dm.view, !bassReferralNeeded],
    [riskManagement.view, !approvedPremisesRequired],
    [victimLiaison.view, true],
    [curfewHours.view, true],
    [additionalConditions.view, true],
    [reportingInstructions.view, true],
    [finalChecks.view, true],
    [postpone, confiscationOrder],
    [returnToPrisonCaseAdmin, true],
    [finalDecision.standard, true],
  ])
}

module.exports = (licenceStatus) => {
  const {
    decisions: { addressWithdrawn, bassAccepted, curfewAddressRejected, insufficientTimeStop },
  } = licenceStatus

  if (insufficientTimeStop) {
    return insufficientTimeStopTaskList(licenceStatus)
  }

  if (bassAccepted !== 'Yes' && (addressWithdrawn || curfewAddressRejected)) {
    return rejectedAddressTaskList(licenceStatus)
  }

  return standardTaskList(licenceStatus)
}

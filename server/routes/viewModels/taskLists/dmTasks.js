const { tasklist, namedTask } = require('./tasklistBuilder')
const bassAddress = require('./tasks/bassAddress')
const proposedAddress = require('./tasks/proposedAddress')
const riskManagement = require('./tasks/riskManagement')
const victimLiaison = require('./tasks/victimLiaison')
const curfewHours = require('./tasks/curfewHours')
const additionalConditions = require('./tasks/additionalConditions')
const reportingInstructions = require('./tasks/reportingInstructions')
const finalChecks = require('./tasks/finalChecks')
const makeFinalDecision = require('./tasks/dm/makeFinalDecision')
const returnToCa = require('./tasks/dm/returnToCa')

const eligibilitySummaryTask = namedTask('eligibilitySummaryTask')

const rejectedAddressTaskList = (licenceStatus) => {
  const { decisions } = licenceStatus
  const showRiskManagement = !(decisions.addressReviewFailed || decisions.addressWithdrawn)
  return tasklist(licenceStatus, [
    [eligibilitySummaryTask],
    [proposedAddress.dm.rejected],
    [riskManagement.view, showRiskManagement],
    [returnToCa],
    [makeFinalDecision.refusal],
  ])
}

const insufficientTimeStopTaskList = (licenceStatus) =>
  tasklist(licenceStatus, [[eligibilitySummaryTask], [makeFinalDecision.refusal]])

const standardTaskList = (licenceStatus) => {
  const {
    decisions: { approvedPremisesRequired, bassReferralNeeded },
  } = licenceStatus
  return tasklist(licenceStatus, [
    [bassAddress.view, bassReferralNeeded],
    [proposedAddress.dm.view, !bassReferralNeeded],
    [riskManagement.view, !approvedPremisesRequired],
    [victimLiaison.view],
    [curfewHours.view],
    [additionalConditions.view],
    [reportingInstructions.view],
    [finalChecks.view],
    [returnToCa],
    [makeFinalDecision.standard],
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

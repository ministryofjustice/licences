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

const tasklist = (tasks) => tasks.filter((task) => task.visible).map(({ visible, ...rest }) => rest)

const rejectedAddressTaskList = (licenceStatus) => {
  const {
    decisions: { addressWithdrawn, addressReviewFailed },
  } = licenceStatus
  const showRiskManagement = !(addressReviewFailed || addressWithdrawn)
  return tasklist([
    { task: 'eligibilitySummaryTask', visible: true },
    proposedAddress.dm.rejected({ decisions: licenceStatus.decisions, tasks: licenceStatus.tasks, visible: true }),
    riskManagement.view({
      decisions: licenceStatus.decisions,
      tasks: licenceStatus.tasks,
      visible: showRiskManagement,
    }),
    returnToPrisonCaseAdmin(),
    {
      title: 'Final decision',
      label: finalDecision.getLabel(licenceStatus),
      action: finalDecision.getRefusalAction(),
      visible: true,
    },
  ])
}

const insufficientTimeStopTaskList = (licenceStatus) => [
  { task: 'eligibilitySummaryTask' },
  {
    title: 'Final decision',
    label: finalDecision.getLabel(licenceStatus),
    action: finalDecision.getRefusalAction(),
  },
]

const standardTaskList = (licenceStatus) => {
  const {
    decisions: { approvedPremisesRequired, bassReferralNeeded, confiscationOrder },
  } = licenceStatus
  return tasklist([
    bassAddress.view({ decisions: licenceStatus.decisions, tasks: licenceStatus.tasks, visible: bassReferralNeeded }),
    proposedAddress.dm.view({
      decisions: licenceStatus.decisions,
      tasks: licenceStatus.tasks,
      visible: !bassReferralNeeded,
    }),
    riskManagement.view({
      decisions: licenceStatus.decisions,
      tasks: licenceStatus.tasks,
      visible: !approvedPremisesRequired,
    }),
    victimLiaison.view({ decisions: licenceStatus.decisions, tasks: licenceStatus.tasks, visible: true }),
    curfewHours.view({ tasks: licenceStatus.tasks, visible: true }),
    additionalConditions.view({ tasks: licenceStatus.tasks, decisions: licenceStatus.decisions, visible: true }),
    reportingInstructions.view({ tasks: licenceStatus.tasks, visible: true }),
    finalChecks.view({ decisions: licenceStatus.decisions, tasks: licenceStatus.tasks, visible: true }),
    postpone({ decisions: licenceStatus.decisions, visible: confiscationOrder }),
    returnToPrisonCaseAdmin(),
    {
      title: 'Final decision',
      label: finalDecision.getLabel(licenceStatus),
      action: finalDecision.getDecisionAction(),
      visible: true,
    },
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

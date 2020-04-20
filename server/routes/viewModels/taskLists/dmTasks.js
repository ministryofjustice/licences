const postponement = require('./tasks/postponement')
const bassOffer = require('./tasks/bassOffer')
const curfewAddress = require('./tasks/curfewAddress')
const riskManagement = require('./tasks/riskManagement')
const victimLiaison = require('./tasks/victimLiaison')
const curfewHours = require('./tasks/curfewHours')
const additionalConditions = require('./tasks/additionalConditions')
const reportingInstructions = require('./tasks/reportingInstructions')
const finalChecks = require('./tasks/finalChecks')
const finalDecision = require('./tasks/finalDecision')

const rejectedAddressTaskList = (licenceStatus) => {
  const {
    decisions: { addressWithdrawn, addressReviewFailed },
  } = licenceStatus
  const showRiskManagement = !(addressReviewFailed || addressWithdrawn)
  return [
    { task: 'eligibilitySummaryTask' },
    {
      title: 'Proposed curfew address',
      label: curfewAddress.getLabel(licenceStatus),
      action: curfewAddress.getDmRejectedAction(),
    },
    ...(showRiskManagement
      ? [
          {
            title: 'Risk management',
            label: riskManagement.getLabel(licenceStatus),
            action: riskManagement.view(),
          },
        ]
      : []),
    {
      title: 'Return to prison case admin',
      action: {
        type: 'btn-secondary',
        href: '/hdc/send/return/',
        text: 'Return to prison case admin',
      },
    },
    {
      title: 'Final decision',
      label: finalDecision.getLabel(licenceStatus),
      action: finalDecision.getRefusalAction(),
    },
  ]
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
  return [
    {
      title: 'BASS address',
      label: bassOffer.getLabel(licenceStatus),
      action: {
        type: 'btn-secondary',
        href: approvedPremisesRequired ? '/hdc/review/approvedPremisesAddress/' : '/hdc/review/bassOffer/',
        text: 'View',
      },
      visible: bassReferralNeeded,
    },
    {
      title: 'Proposed curfew address',
      label: curfewAddress.getLabel(licenceStatus),
      action: curfewAddress.getDmAction(licenceStatus),
      visible: !bassReferralNeeded,
    },
    {
      title: 'Risk management',
      label: riskManagement.getLabel(licenceStatus),
      action: riskManagement.view(),
      visible: !approvedPremisesRequired,
    },
    {
      title: 'Victim liaison',
      label: victimLiaison.getLabel(licenceStatus),
      action: victimLiaison.view(),
      visible: true,
    },
    {
      title: 'Curfew hours',
      label: curfewHours.getLabel(licenceStatus),
      action: curfewHours.view(),
      visible: true,
    },
    {
      title: 'Additional conditions',
      label: additionalConditions.getLabel(licenceStatus),
      action: additionalConditions.view(),
      visible: true,
    },
    {
      title: 'Reporting instructions',
      label: reportingInstructions.getLabel(licenceStatus),
      action: reportingInstructions.view(),
      visible: true,
    },
    {
      title: 'Review case',
      label: finalChecks.getLabel(licenceStatus),
      action: finalChecks.view(),
      visible: true,
    },
    {
      title: 'Postpone',
      label: postponement.getLabel(licenceStatus),
      action: postponement.getAction(licenceStatus),
      visible: confiscationOrder,
    },
    {
      title: 'Return to prison case admin',
      action: {
        type: 'btn-secondary',
        href: '/hdc/send/return/',
        text: 'Return to prison case admin',
      },
      visible: true,
    },
    {
      title: 'Final decision',
      label: finalDecision.getLabel(licenceStatus),
      action: finalDecision.getDecisionAction(),
      visible: true,
    },
  ]
    .filter((task) => task.visible)
    .map(({ visible, ...rest }) => rest)
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

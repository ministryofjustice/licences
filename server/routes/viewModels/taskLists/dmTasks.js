const postponement = require('./tasks/postponement')
const bassOffer = require('./tasks/bassOffer')
const curfewAddress = require('./tasks/curfewAddress')
const riskManagement = require('./tasks/riskManagement')
const victimLiaison = require('./tasks/victimLiaison')
const curfewHours = require('./tasks/curfewHours')
const additionalConditions = require('./tasks/additionalConditions')
const reportingInstructions = require('./tasks/reportingInstructions')
const finalChecks = require('./tasks/finalChecks')
const { getStatusLabel } = require('../../../utils/licenceStatusLabels')

const rejectedAddressTaskList = licenceStatus => {
  const {
    decisions: { addressWithdrawn, addressReviewFailed },
  } = licenceStatus

  const taskList = [
    { task: 'eligibilitySummaryTask' },
    {
      title: 'Proposed curfew address',
      label: curfewAddress.getLabel(licenceStatus),
      action: {
        type: 'btn-secondary',
        href: '/hdc/review/address/',
        text: 'View',
      },
    },
  ]

  if (!(addressReviewFailed || addressWithdrawn)) {
    taskList.push({
      title: 'Risk management',
      label: riskManagement.getLabel(licenceStatus),
      action: {
        type: 'btn-secondary',
        href: '/hdc/review/risk/',
        text: 'View',
      },
    })
  }

  taskList.push(
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
      label: getDecisionLabel(licenceStatus),
      action: {
        type: 'btn',
        href: '/hdc/approval/refuseReason/',
        text: 'Refuse HDC',
      },
    }
  )
  return taskList
}

module.exports = licenceStatus => {
  const {
    decisions: {
      addressWithdrawn,
      approvedPremisesRequired,
      bassReferralNeeded,
      confiscationOrder,
      curfewAddressRejected,
      insufficientTimeStop,
    },
  } = licenceStatus

  if (insufficientTimeStop) {
    return [
      { task: 'eligibilitySummaryTask' },
      {
        title: 'Final decision',
        label: getDecisionLabel(licenceStatus),
        action: {
          type: 'btn',
          href: '/hdc/approval/refuseReason/',
          text: 'Refuse HDC',
        },
      },
    ]
  }

  if (addressWithdrawn || curfewAddressRejected) {
    return rejectedAddressTaskList(licenceStatus)
  }

  return [
    {
      title: 'BASS address',
      label: bassOffer.getLabel(licenceStatus),
      action: {
        type: 'btn-secondary',
        href: '/hdc/review/bassOffer/',
        text: 'View',
      },
    },
    {
      title: 'Proposed curfew address',
      label: curfewAddress.getLabel(licenceStatus),
      action: curfewAddress.getDmAction(licenceStatus),
    },
    {
      title: 'Risk management',
      label: riskManagement.getLabel(licenceStatus),
      action: {
        type: 'btn-secondary',
        href: '/hdc/review/risk/',
        text: 'View',
      },
    },
    {
      title: 'Victim liaison',
      label: victimLiaison.getLabel(licenceStatus),
      action: {
        type: 'btn-secondary',
        href: '/hdc/review/victimLiaison/',
        text: 'View',
      },
    },
    {
      title: 'Curfew hours',
      label: curfewHours.getLabel(licenceStatus),
      action: {
        type: 'btn-secondary',
        href: '/hdc/review/curfewHours/',
        text: 'View',
      },
    },
    {
      title: 'Additional conditions',
      label: additionalConditions.getLabel(licenceStatus),
      action: {
        type: 'btn-secondary',
        href: '/hdc/review/conditions/',
        text: 'View',
      },
    },
    {
      title: 'Reporting instructions',
      label: reportingInstructions.getLabel(licenceStatus),
      action: {
        type: 'btn-secondary',
        href: '/hdc/review/reporting/',
        text: 'View',
      },
    },
    {
      title: 'Review case',
      label: finalChecks.getLabel(licenceStatus),
      action: {
        type: 'btn-secondary',
        href: '/hdc/review/finalChecks/',
        text: 'View',
      },
    },
    {
      title: 'Postpone',
      label: postponement.getLabel(licenceStatus),
      action: postponement.getAction(licenceStatus),
    },
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
      label: getDecisionLabel(licenceStatus),
      action: {
        type: 'btn',
        href: '/hdc/approval/release/',
        text: 'Continue',
      },
    },
  ].filter(task => {
    if (task.title === 'BASS address') {
      return bassReferralNeeded
    }

    if (task.title === 'Proposed curfew address') {
      return !bassReferralNeeded
    }

    if (task.title === 'Postpone') {
      return confiscationOrder
    }

    if (task.title === 'Risk management') {
      return !approvedPremisesRequired
    }

    return true
  })
}

function getDecisionLabel(licenceStatus) {
  const { statusLabel } = getStatusLabel(licenceStatus, 'DM')

  const {
    decisions: { refused, refusalReason },
  } = licenceStatus

  if (refused && refusalReason) {
    return `${statusLabel} : ${refusalReason}`
  }
  return statusLabel
}

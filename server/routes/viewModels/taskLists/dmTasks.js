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

module.exports = ({ decisions, tasks, stage }) => {
  const {
    insufficientTimeStop,
    addressWithdrawn,
    addressUnsuitable,
    curfewAddressRejected,
    bassReferralNeeded,
    confiscationOrder,
    approvedPremisesRequired,
  } = decisions

  if (insufficientTimeStop) {
    return [
      { task: 'eligibilitySummaryTask' },
      {
        title: 'Final decision',
        label: getDecisionLabel({ decisions, tasks, stage }),
        action: {
          type: 'btn',
          href: '/hdc/approval/refuseReason/',
          text: 'Refuse HDC',
        },
      },
    ]
  }

  if (addressWithdrawn || curfewAddressRejected) {
    const t = [
      { task: 'eligibilitySummaryTask' },
      {
        title: 'Proposed curfew address',
        label: curfewAddress.getLabel({ decisions, tasks }),
        action: {
          type: 'btn-secondary',
          href: '/hdc/review/address/',
          text: 'View',
        },
      },
    ]

    if (!(addressUnsuitable || addressWithdrawn)) {
      t.push({
        title: 'Risk management',
        label: riskManagement.getLabel({ decisions, tasks }),
        action: {
          type: 'btn-secondary',
          href: '/hdc/review/risk/',
          text: 'View',
        },
      })
    }

    t.push(
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
        label: getDecisionLabel({ decisions, tasks, stage }),
        action: {
          type: 'btn',
          href: '/hdc/approval/refuseReason/',
          text: 'Refuse HDC',
        },
      }
    )
    return t
  }

  return [
    {
      title: 'BASS address',
      label: bassOffer.getLabel({ decisions, tasks }),
      action: {
        type: 'btn-secondary',
        href: '/hdc/review/bassOffer/',
        text: 'View',
      },
    },
    {
      title: 'Proposed curfew address',
      label: curfewAddress.getLabel({ decisions, tasks }),
      action: curfewAddress.getDmAction({ decisions }),
    },
    {
      title: 'Risk management',
      label: riskManagement.getLabel({ decisions, tasks }),
      action: {
        type: 'btn-secondary',
        href: '/hdc/review/risk/',
        text: 'View',
      },
    },
    {
      title: 'Victim liaison',
      label: victimLiaison.getLabel({ decisions, tasks }),
      action: {
        type: 'btn-secondary',
        href: '/hdc/review/victimLiaison/',
        text: 'View',
      },
    },
    {
      title: 'Curfew hours',
      label: curfewHours.getLabel({ decisions, tasks }),
      action: {
        type: 'btn-secondary',
        href: '/hdc/review/curfewHours/',
        text: 'View',
      },
    },
    {
      title: 'Additional conditions',
      label: additionalConditions.getLabel({ decisions, tasks }),
      action: {
        type: 'btn-secondary',
        href: '/hdc/review/conditions/',
        text: 'View',
      },
    },
    {
      title: 'Reporting instructions',
      label: reportingInstructions.getLabel({ decisions, tasks }),
      action: {
        type: 'btn-secondary',
        href: '/hdc/review/reporting/',
        text: 'View',
      },
    },
    {
      title: 'Review case',
      label: finalChecks.getLabel({ decisions, tasks }),
      action: {
        type: 'btn-secondary',
        href: '/hdc/review/finalChecks/',
        text: 'View',
      },
    },
    {
      title: 'Postpone',
      label: postponement.getLabel({ decisions }),
      action: postponement.getAction({ decisions }),
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
      label: getDecisionLabel({ decisions, tasks, stage }),
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

function getDecisionLabel({ decisions, tasks, stage }) {
  const { refused, refusalReason } = decisions
  const { statusLabel } = getStatusLabel({ decisions, tasks, stage }, 'DM')

  if (refused && refusalReason) {
    return `${statusLabel} : ${refusalReason}`
  }
  return statusLabel
}

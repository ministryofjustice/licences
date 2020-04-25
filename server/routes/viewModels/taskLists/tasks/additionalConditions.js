const { standardAction, viewEdit, view } = require('./utils/actions')

const getLabel = ({ decisions, tasks }, role) => {
  const { standardOnly, bespoke, bespokeRejected, bespokePending, additional } = decisions
  const { licenceConditions } = tasks

  if (licenceConditions === 'DONE') {
    if (standardOnly) {
      return 'Standard conditions only'
    }

    const bespokeConditionsText =
      role === 'CA'
        ? 'Some bespoke conditions were rejected. Remove these and inform the responsible officer.'
        : 'Some bespoke conditions have not been approved. Contact Public Protection Casework Section and ask them to review these.'

    const unapproved = bespokeRejected > 0 ? bespokeConditionsText : ''
    const pending = bespokePending ? 'You still need approval for some bespoke conditions.' : ''

    if (unapproved || pending) {
      return ['WARNING', unapproved, pending].filter(Boolean).join('||')
    }

    const totalConditions = bespoke + additional

    return `${totalConditions} condition${totalConditions > 1 ? 's' : ''} added`
  }
  return 'Not completed'
}

const title = 'Additional conditions'

module.exports = {
  edit: ({ decisions, tasks }) => {
    return {
      title,
      label: getLabel({ decisions, tasks }, 'CA'),
      action: viewEdit('/hdc/licenceConditions/standard/', 'additional-conditions'),
    }
  },
  view: ({ decisions, tasks }) => {
    return {
      title,
      label: getLabel({ decisions, tasks }),
      action: view('/hdc/review/conditions/'),
    }
  },
  ro: ({ decisions, tasks }) => {
    const { licenceConditions } = tasks
    return {
      title,
      label: getLabel({ decisions, tasks }),
      action: standardAction(licenceConditions, '/hdc/licenceConditions/standard/'),
    }
  },
}

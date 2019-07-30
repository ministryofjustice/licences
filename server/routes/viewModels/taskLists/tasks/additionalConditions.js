const { standardAction } = require('./utils/actions')

module.exports = {
  getLabel: ({ decisions, tasks }) => {
    const { standardOnly, bespoke, bespokeRejected, bespokePending, additional } = decisions
    const { licenceConditions } = tasks

    if (licenceConditions === 'DONE') {
      if (standardOnly) {
        return 'Standard conditions only'
      }

      const unapproved =
        bespokeRejected > 0
          ? 'Some bespoke conditions have not been approved. Contact Public Protection Casework Section and ask them to review these.'
          : ''
      const pending = bespokePending ? 'You still need approval for some bespoke conditions.' : ''

      if (unapproved || pending) {
        return ['WARNING', unapproved, pending].filter(Boolean).join('||')
      }

      const totalConditions = bespoke + additional

      return `${totalConditions} condition${totalConditions > 1 ? 's' : ''} added`
    }
    return 'Not completed'
  },

  getRoAction: ({ tasks }) => {
    const { licenceConditions } = tasks
    return standardAction(licenceConditions, '/hdc/licenceConditions/standard/')
  },
}

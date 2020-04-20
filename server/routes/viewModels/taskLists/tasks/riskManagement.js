const { standardAction, viewEdit, view } = require('./utils/actions')

module.exports = {
  getLabel: ({ decisions, tasks }) => {
    const { addressUnsuitable, awaitingRiskInformation, riskManagementNeeded } = decisions
    const { riskManagement } = tasks

    if (addressUnsuitable) {
      return 'Address unsuitable'
    }

    if (awaitingRiskInformation) {
      return 'WARNING||Still waiting for information'
    }

    if (riskManagement === 'DONE') {
      return riskManagementNeeded ? 'Risk management required' : 'No risks'
    }

    return 'Not completed'
  },

  view: () => view('/hdc/review/risk/'),

  getRoAction: ({ tasks }) => {
    const { riskManagement } = tasks
    return standardAction(riskManagement, '/hdc/risk/riskManagement/')
  },

  edit: () => viewEdit('/hdc/risk/riskManagement/', 'risk-management'),
}

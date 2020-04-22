const { standardAction, viewEdit, view } = require('./utils/actions')

const getLabel = ({ decisions, tasks }) => {
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
}

const title = 'Risk management'

module.exports = {
  edit: ({ decisions, tasks, visible }) => {
    return {
      title,
      label: getLabel({ decisions, tasks }),
      action: viewEdit('/hdc/risk/riskManagement/', 'risk-management'),
      visible,
    }
  },
  view: ({ decisions, tasks, visible }) => {
    return {
      title,
      label: getLabel({ decisions, tasks }),
      action: view('/hdc/review/risk/'),
      visible,
    }
  },
  ro: ({ decisions, tasks, visible }) => {
    const { riskManagement } = tasks
    return {
      title,
      label: getLabel({ decisions, tasks }),
      action: standardAction(riskManagement, '/hdc/risk/riskManagement/'),
      visible,
    }
  },
}

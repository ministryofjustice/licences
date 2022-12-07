const { standardAction, viewEdit, view } = require('./utils/actions')

const getLabel = ({ decisions, tasks }) => {
  const {
    riskManagementVersion,
    riskManagementNeeded,
    showMandatoryAddressChecksNotCompletedWarning,
    addressUnsuitable,
    awaitingRiskInformation,
  } = decisions
  const { riskManagement } = tasks

  if (riskManagementVersion === '2') {
    if (addressUnsuitable) {
      return 'Address unsuitable'
    }

    if (showMandatoryAddressChecksNotCompletedWarning) {
      return 'WARNING||Mandatory address checks not completed'
    }

    if (awaitingRiskInformation) {
      return 'WARNING||Still waiting for information'
    }

    if (riskManagement === 'DONE') {
      return 'Completed'
    }
  } else {
    if (addressUnsuitable) {
      return 'Address unsuitable'
    }

    if (awaitingRiskInformation) {
      return 'WARNING||Still waiting for information'
    }

    if (riskManagement === 'DONE') {
      return riskManagementNeeded ? 'Risk management required' : 'No risks'
    }
  }

  return 'Not completed'
}

const title = 'Risk management'

module.exports = {
  edit: ({ decisions, tasks }) => {
    return {
      title,
      label: getLabel({ decisions, tasks }),
      action: viewEdit('/hdc/risk/riskManagement/', 'risk-management'),
    }
  },
  view: ({ decisions, tasks }) => {
    return {
      title,
      label: getLabel({ decisions, tasks }),
      action: view('/hdc/review/risk/'),
    }
  },
  ro: ({ decisions, tasks }) => {
    const { riskManagement } = tasks
    return {
      title,
      label: getLabel({ decisions, tasks }),
      action: standardAction(riskManagement, '/hdc/risk/riskManagement/'),
    }
  },
}

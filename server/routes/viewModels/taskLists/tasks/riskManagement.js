const { standardAction, viewEdit, view } = require('./utils/actions')

const getLabel = ({ decisions, tasks }) => {
  const {
    riskManagementVersion,
    riskManagementNeededV1,
    mandatoryAddressChecksNotCompletedV2,
    addressUnsuitable,
    awaitingRiskInformation,
    bassAreaSuitable,
  } = decisions
  const { riskManagement } = tasks

  if (addressUnsuitable) {
    return 'Address unsuitable'
  }

  if (mandatoryAddressChecksNotCompletedV2 && !bassAreaSuitable) {
    return 'WARNING||Mandatory address checks not completed'
  }

  if (awaitingRiskInformation) {
    return 'WARNING||Still waiting for information'
  }

  if (riskManagement === 'DONE' && riskManagementVersion !== '2') {
    return riskManagementNeededV1 ? 'Risk management required' : 'No risks'
  }

  if (riskManagement === 'DONE' && riskManagementVersion === '2') {
    return 'Completed'
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

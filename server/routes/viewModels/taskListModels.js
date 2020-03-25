const { pickKey } = require('../../utils/functionalHelpers')
const getDmTasks = require('./taskLists/dmTasks')
const { getRoTasksPostApproval, getRoTasks } = require('./taskLists/roTasks')
const { getCaTasksEligibility, getCaTasksFinalChecks, getCaTasksPostApproval } = require('./taskLists/caTasks')
const getVaryTasks = require('./taskLists/varyTasks')

const taskListsConfig = {
  caTasksEligibility: {
    stages: ['ELIGIBILITY', 'UNSTARTED'],
    role: 'CA',
  },
  caTasksPostApproval: {
    stages: ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL'],
    role: 'CA',
  },
  caTasksFinalChecks: {
    stages: ['PROCESSING_CA', 'PROCESSING_RO', 'APPROVAL'],
    role: 'CA',
  },
  roTasks: {
    stages: ['PROCESSING_RO', 'PROCESSING_CA', 'APPROVAL', 'ELIGIBILITY'],
    role: 'RO',
  },
  roTasksPostApproval: {
    stages: ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL'],
    role: 'RO',
  },
  dmTasks: {
    role: 'DM',
  },
}

module.exports = (
  role,
  postRelease,
  { decisions, tasks, stage },
  { version = null, versionDetails = null, approvedVersion = {}, approvedVersionDetails = {}, licence = {} } = {},
  allowedTransition
) => {
  const taskListName = getTaskListName(role, stage, postRelease)

  switch (taskListName) {
    case 'dmTasks':
      return getDmTasks({ decisions, tasks, stage, allowedTransition })

    case 'roTasks':
      return getRoTasks({ decisions, tasks, allowedTransition })

    case 'roTasksPostApproval':
      return getRoTasksPostApproval({ decisions, tasks })

    case 'caTasksEligibility':
      return getCaTasksEligibility({ decisions, tasks, allowedTransition })

    case 'caTasksFinalChecks':
      return getCaTasksFinalChecks({ decisions, tasks, allowedTransition })

    case 'caTasksPostApproval':
      return getCaTasksPostApproval(stage)({ decisions, tasks, allowedTransition })

    case 'vary':
      return getVaryTasks({ version, versionDetails, approvedVersion, approvedVersionDetails, licence })({ stage })

    default:
      return [
        {
          title: 'No active licence',
          action: { type: 'link', text: 'Return to case list', href: '/caseList/' },
        },
      ]
  }
}

function getTaskListName(role, stage, postRelease) {
  if (postRelease) {
    return 'vary'
  }

  return (
    pickKey(view => view.role === role && (!view.stages || view.stages.includes(stage)))(taskListsConfig) ||
    'noTaskList'
  )
}

const { pickKey } = require('../../utils/functionalHelpers')
const getDmTasks = require('./taskLists/dmTasks')
const { getRoTasksPostApproval, getRoTasks } = require('./taskLists/roTasks')
const { getCaTasksEligibility, getCaTasksFinalChecks, getCaTasksPostApproval } = require('./taskLists/caTasks')
const getVaryTasks = require('./taskLists/varyTasks')
const proposedAddress = require('./taskLists/tasks/proposedAddress')

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
  allowedTransition,
  errors
) => {
  const taskListName = getTaskListName(role, stage, postRelease)

  const getTaskListTasksMethod = {
    dmTasks: getDmTasks,
    roTasks: getRoTasks,
    roTasksPostApproval: getRoTasksPostApproval,
    caTasksEligibility: getCaTasksEligibility,
    caTasksFinalChecks: getCaTasksFinalChecks,
    caTasksPostApproval: getCaTasksPostApproval(stage),
    vary: getVaryTasks({ version, versionDetails, approvedVersion, approvedVersionDetails, licence }),
  }
  if (errors && errors.length > 0) {
    return [
      {
        task: 'eligibilityTask',
      },
      {
        title: 'Inform the offender',
        label: 'You should now tell the offender using the relevant HDC form from NOMIS',
        action: {
          type: 'btn-secondary',
          href: '/caseList/active',
          text: 'Back to case list',
        },
      },
      {
        title: 'Curfew address',
        label: proposedAddress.getLabel({ decisions, tasks }),
        action: { text: 'Start now', type: 'btn-disabled', href: '' },
      },
    ]
  }

  if (!getTaskListTasksMethod[taskListName]) {
    return [
      {
        title: 'No active licence',
        action: { type: 'link', text: 'Return to case list', href: '/caseList/' },
      },
    ]
  }

  return getTaskListTasksMethod[taskListName]({ decisions, tasks, stage, allowedTransition })
}

function getTaskListName(role, stage, postRelease) {
  if (postRelease) {
    return 'vary'
  }

  function roleAndStageMatch(view) {
    if (view.role !== role) {
      return false
    }
    if (!view.stages) {
      return true
    }
    return view.stages.includes(stage)
  }

  return pickKey(roleAndStageMatch, taskListsConfig) || 'noTaskList'
}

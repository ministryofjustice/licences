const getDmTasks = require('./taskLists/dmTasks')
const { getRoTasksPostApproval, getRoTasks } = require('./taskLists/roTasks')
const roTransitions = require('../../services/licence/roTransitions')
const caTransitions = require('../../services/licence/caTransitions')
const { getCaTasksEligibility, getCaTasksFinalChecks, getCaTasksPostApproval } = require('./taskLists/caTasks')
const getVaryTasks = require('./taskLists/varyTasks')

module.exports = (
  role,
  postRelease,
  licenceStatus,
  errorCode,
  { version = null, versionDetails = null, approvedVersion = {}, approvedVersionDetails = {}, licence = {} } = {}
) => {
  const { decisions, tasks, stage } = licenceStatus

  if (postRelease) {
    return getVaryTasks({ version, versionDetails, approvedVersion, approvedVersionDetails, licence })({ stage })
  }

  if (role === 'DM') {
    return getDmTasks({ decisions, tasks, stage })
  }

  if (role === 'CA') {
    const allowedTransition = caTransitions(licenceStatus)

    switch (stage) {
      case 'UNSTARTED':
      case 'ELIGIBILITY':
        return getCaTasksEligibility({ decisions, tasks, allowedTransition, errorCode })

      case 'PROCESSING_RO':
      case 'PROCESSING_CA':
      case 'APPROVAL':
        return getCaTasksFinalChecks({ decisions, tasks, allowedTransition, errorCode })

      case 'DECIDED':
      case 'MODIFIED':
      case 'MODIFIED_APPROVAL':
        return getCaTasksPostApproval(stage)({ decisions, tasks, allowedTransition })

      default: // fall through
    }
  }

  if (role === 'RO') {
    const allowedTransition = roTransitions(licenceStatus)

    switch (stage) {
      case 'ELIGIBILITY':
      case 'PROCESSING_RO':
      case 'PROCESSING_CA':
      case 'APPROVAL':
        return getRoTasks({ decisions, tasks, allowedTransition })

      case 'DECIDED':
      case 'MODIFIED':
      case 'MODIFIED_APPROVAL':
        return getRoTasksPostApproval({ decisions, tasks })

      default: // fall through
    }
  }

  return [
    {
      title: 'No active licence',
      action: { type: 'link', text: 'Return to case list', href: '/caseList/' },
    },
  ]
}

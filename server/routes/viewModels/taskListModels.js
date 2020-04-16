const { pickKey } = require('../../utils/functionalHelpers')
const getDmTasks = require('./taskLists/dmTasks')
const { getRoTasksPostApproval, getRoTasks } = require('./taskLists/roTasks')
const { getAllowedTransition } = require('../../utils/licenceStatusTransitions')
const { getCaTasksEligibility, getCaTasksFinalChecks, getCaTasksPostApproval } = require('./taskLists/caTasks')
const getVaryTasks = require('./taskLists/varyTasks')

module.exports = (
  role,
  postRelease,
  licenceStatus,
  { version = null, versionDetails = null, approvedVersion = {}, approvedVersionDetails = {}, licence = {} } = {}
) => {
  const { decisions, tasks, stage } = licenceStatus
  const allowedTransition = getAllowedTransition(licenceStatus, role)

  if (postRelease) {
    return getVaryTasks({ version, versionDetails, approvedVersion, approvedVersionDetails, licence })({ stage })
  }

  if (role === 'DM') {
    return getDmTasks({ decisions, tasks, stage })
  }

  if (role === 'CA') {
    switch (stage) {
      case 'UNSTARTED':
      case 'ELIGIBILITY':
        return getCaTasksEligibility({ decisions, tasks, allowedTransition })

      case 'PROCESSING_RO':
      case 'PROCESSING_CA':
      case 'APPROVAL':
        return getCaTasksFinalChecks({ decisions, tasks, allowedTransition })

      case 'DECIDED':
      case 'MODIFIED':
      case 'MODIFIED_APPROVAL':
        return getCaTasksPostApproval(stage)({ decisions, tasks, allowedTransition })

      default: // fall through
    }
  }

  if (role === 'RO') {
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

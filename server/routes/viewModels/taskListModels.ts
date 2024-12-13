import getDmTasks from './taskLists/dmTasks'
import { getRoTasksPostApproval, getRoTasks } from './taskLists/roTasks'
import roTransitions from '../../services/licence/roTransitions'
import getVaryTasks from './taskLists/varyTasks'
import caTransitions from '../../services/licence/caTransitions'
import { getCaTasksEligibility, getCaTasksFinalChecks, getCaTasksPostApproval } from './taskLists/caTasks'

export const getCaTaskLists = (licenceStatus, errorCode) => {
  const { decisions, tasks, stage } = licenceStatus

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

  return [
    {
      title: 'No active licence',
      action: { type: 'link', text: 'Return to case list', href: '/caseList/' },
    },
  ]
}

export const getTaskLists = (
  role,
  postRelease,
  licenceStatus,
  { version = null, versionDetails = null, approvedVersion = {}, approvedVersionDetails = {}, licence = {} } = {}
) => {
  const { decisions, tasks, stage } = licenceStatus

  if (postRelease) {
    return getVaryTasks({ version, versionDetails, approvedVersion, approvedVersionDetails, licence })({ stage })
  }

  if (role === 'DM') {
    return getDmTasks({ decisions, tasks, stage })
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

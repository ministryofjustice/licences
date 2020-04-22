const { continueBtn } = require('./utils/actions')

const getLabel = (optedOut, bassRequest) => {
  if (optedOut) {
    return 'Submission unavailable - Offender has opted out of HDC'
  }

  return ['STARTED', 'DONE'].includes(bassRequest) ? 'Ready to submit' : 'Not completed'
}

const getCaAction = (optedOut, bassRequest) => {
  if (!optedOut && ['STARTED', 'DONE'].includes(bassRequest)) {
    return continueBtn('/hdc/review/bassRequest/')
  }
  return null
}

module.exports = ({ decisions, tasks, visible }) => {
  const { optedOut } = decisions
  const { bassRequest } = tasks
  return {
    title: 'Send for BASS area checks',
    label: getLabel(optedOut, bassRequest),
    action: getCaAction(optedOut, bassRequest),
    visible,
  }
}

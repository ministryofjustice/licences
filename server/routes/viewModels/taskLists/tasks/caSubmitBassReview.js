const { continueBtn } = require('./utils/actions')

module.exports = {
  getLabel: ({ decisions, tasks }) => {
    const { optedOut } = decisions
    const { bassRequest } = tasks

    if (optedOut) {
      return 'Submission unavailable - Offender has opted out of HDC'
    }

    return ['STARTED', 'DONE'].includes(bassRequest) ? 'Ready to submit' : 'Not completed'
  },

  getCaAction: ({ decisions, tasks }) => {
    const { optedOut } = decisions
    const { bassRequest } = tasks
    if (!optedOut && ['STARTED', 'DONE'].includes(bassRequest)) {
      return continueBtn('/hdc/review/bassRequest/')
    }
    return null
  },
}

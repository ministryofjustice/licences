const { continueBtn } = require('./utils/actions')

module.exports = {
  getLabel: ({ tasks }) => {
    const { curfewAddress } = tasks
    return curfewAddress === 'DONE' ? 'Ready to submit' : 'Not completed'
  },

  getCaAction: ({ decisions, tasks }) => {
    const { optedOut } = decisions
    const { curfewAddress } = tasks
    if (curfewAddress === 'DONE' && !optedOut) {
      return continueBtn('/hdc/review/curfewAddress/')
    }
    return null
  },
}

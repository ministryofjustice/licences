const { taskBtn } = require('./utils/actions')

module.exports = {
  getLabel: () => {
    return 'Submit back to the DM if a reconsideration is required'
  },

  getCaAction: () => {
    return taskBtn('/hdc/send/approval/', 'Resubmit', ' ')
  },
}

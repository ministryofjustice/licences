const { taskBtn } = require('./utils/actions')

module.exports = {
  getLabel: () => {
    return 'Resubmit to the DM if a reconsideration is required'
  },

  getCaAction: () => {
    return taskBtn('/hdc/send/resubmit/', 'Resubmit', true, 'resubmit')
  },
}

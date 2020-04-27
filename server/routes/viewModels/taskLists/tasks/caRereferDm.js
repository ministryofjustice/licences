const { taskBtn } = require('./utils/actions')

module.exports = () => {
  return {
    title: 'Resubmit to DM',
    label: 'Resubmit to the DM if a reconsideration is required',
    action: taskBtn('/hdc/send/resubmit/', 'Resubmit', true, 'resubmit'),
  }
}

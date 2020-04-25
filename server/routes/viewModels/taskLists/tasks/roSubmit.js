const { continueBtn } = require('./utils/actions')

module.exports = ({ allowedTransition, decisions }) => {
  const { optedOut } = decisions
  return {
    title: 'Submit to prison case admin',
    label: allowedTransition === 'roToCa' ? 'Ready to submit' : 'Tasks not yet complete',
    action: optedOut ? continueBtn('/hdc/send/optedOut/') : continueBtn('/hdc/review/licenceDetails/'),
    visible: true,
  }
}

const { continueBtn } = require('./utils/actions')

module.exports = {
  getLabel: ({ decisions, allowedTransition }) => {
    const { postponed, finalChecksRefused } = decisions

    if (allowedTransition === 'caToDm') {
      return 'Ready to submit'
    }

    if (postponed) {
      return 'Submission unavailable - HDC application postponed'
    }

    if (finalChecksRefused) {
      return 'Submission unavailable - HDC refused'
    }

    return 'Not completed'
  },

  getCaAction: ({ allowedTransition }) => {
    return allowedTransition === 'caToDm' ? continueBtn('/hdc/send/approval/') : null
  },
}

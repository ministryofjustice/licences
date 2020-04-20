const { standardAction } = require('./utils/actions')

const { getStatusLabel } = require('../../../../utils/licenceStatusLabels')

module.exports = {
  getLabel(licenceStatus) {
    const { statusLabel } = getStatusLabel(licenceStatus, 'DM')

    const {
      decisions: { refused, refusalReason },
    } = licenceStatus

    if (refused && refusalReason) {
      return `${statusLabel}`
    }
    return statusLabel
  },

  getRefusalAction: () => {
    return {
      type: 'btn',
      href: '/hdc/approval/refuseReason/',
      text: 'Refuse HDC',
    }
  },

  getDecisionAction: () => {
    return {
      type: 'btn',
      href: '/hdc/approval/release/',
      text: 'Continue',
    }
  },
}

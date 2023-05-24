const { getStatusLabel } = require('../../../../../services/licence/licenceStatusLabels')

const getLabel = (licenceStatus) => {
  const { statusLabel } = getStatusLabel(licenceStatus, 'DM')
  return statusLabel
}

module.exports = {
  standard: (licenceStatus) => {
    return {
      title: 'Final decision',
      label: getLabel(licenceStatus),
      action: {
        type: 'btn',
        href: '/hdc/approval/consideration/',
        text: 'Continue',
      },
    }
  },
  refusal: (licenceStatus) => {
    return {
      title: 'Final decision',
      label: getLabel(licenceStatus),
      action: {
        type: 'btn',
        href: '/hdc/approval/refuseReason/',
        text: 'Refuse HDC',
      },
    }
  },
  mandatoryCheck: (licenceStatus) => {
    return {
      title: 'Final decision',
      label: getLabel(licenceStatus),
      action: {
        type: 'btn',
        href: '/hdc/approval/mandatoryCheck/',
        text: 'Continue ',
      },
    }
  },
}

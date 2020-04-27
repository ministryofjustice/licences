const { getStatusLabel } = require('../../../../../utils/licenceStatusLabels')

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
        href: '/hdc/approval/release/',
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
}

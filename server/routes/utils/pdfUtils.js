const moment = require('moment')
const {
  pdf: {
    forms: { formsFileDateFormat },
  },
} = require('../../config')

function curfewAddressCheckFormFileName(prisoner) {
  const fileDate = moment().format(formsFileDateFormat)

  const first = prisoner.firstName || ''
  const last = prisoner.lastName || ''
  const offenderNo = prisoner.offenderNo || ''

  const elements = [offenderNo, first, last, fileDate]

  const filename = elements.filter(Boolean).join(' ')

  return `HDC report ${filename}.pdf`
}

module.exports = {
  curfewAddressCheckFormFileName,
}

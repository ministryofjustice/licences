const moment = require('moment')
const { getIn } = require('../utils/functionalHelpers')

module.exports = function createFormService(pdfService, pdfFormatter) {
  async function generatePdf(templateName, licence, prisoner) {
    const dateNow = moment().format('DD/MM/YYYY')

    const values = {
      CREATION_DATE: dateNow,
      OFF_NAME: getOffenderName(prisoner),
      OFF_NOMS: getValue(prisoner, ['offenderNo']),
      EST_PREMISE: getValue(prisoner, ['agencyLocationDesc']),
      SENT_HDCED: getValue(prisoner, ['sentenceDetail', 'homeDetentionCurfewEligibilityDate']),
      SENT_CRD: getValue(prisoner, ['sentenceDetail', 'releaseDate']),
      REFUSAL_REASON: getRefusalReason(licence),
      CURFEW_ADDRESS: getCurfewAddress(pdfFormatter.pickCurfewAddress(licence)),
    }

    return pdfService.getPdf(templateName, values)
  }

  function getValue(data, path) {
    return getIn(data, path) || ''
  }

  function combine(data, paths, separator) {
    return (
      paths
        .map(path => getIn(data, path))
        .filter(Boolean)
        .join(separator) || ''
    )
  }

  function getOffenderName(prisonerInfo) {
    return combine(prisonerInfo, [['firstName'], ['middleName'], ['lastName']], ' ')
  }

  function getCurfewAddress(address) {
    return address ? combine(address, [['addressLine1'], ['addressLine2'], ['addressTown'], ['postCode']], '\n') : ''
  }

  const noAddress = 'there is no suitable address for you to live at'
  const noTime = 'there is not enough time before you’re due to be released'

  const refusalReasonlabels = {
    addressUnsuitable: noAddress,
    insufficientTime: noTime,
    outOfTime: noTime,
    noAvailableAddress: noAddress,
  }

  function getRefusalReason(licence) {
    const finalChecksRefusalReason = getIn(licence, ['finalChecks', 'release', 'reason'])

    if (finalChecksRefusalReason) {
      return refusalReasonlabels[pickFirst(finalChecksRefusalReason)] || ''
    }

    const dmRefusalReason = getIn(licence, ['approval', 'release', 'reason'])
    return refusalReasonlabels[pickFirst(dmRefusalReason)] || ''
  }

  function pickFirst(reasons) {
    return Array.isArray(reasons) ? reasons[0] : reasons
  }

  return {
    generatePdf,
  }
}

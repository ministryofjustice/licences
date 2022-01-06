/**
 * @typedef {import("../services/prisonerService").PrisonerService} PrisonerService
 * @typedef {import("../services/conditionsService").ConditionsServiceFactory} ConditionsServiceFactory
 */
const moment = require('moment')
const { isEmpty, getIn, mergeWithRight } = require('../utils/functionalHelpers')
const {
  pdf: {
    forms: { formsDateFormat },
  },
} = require('../config')
const {
  requiredFields,
  refusalReasonlabels,
  ineligibleReasonlabels,
  unsuitableReasonlabels,
} = require('./config/formConfig')
const logger = require('../../log')
const { CURRENT_CONDITION_VERSION } = require('./config/conditionsConfig')

/**
 * @param {PrisonerService} prisonerService
 * @param {ConditionsServiceFactory} conditionsServiceFactory
 */
module.exports = function createFormService(pdfFormatter, conditionsServiceFactory, prisonerService, configClient) {
  async function getTemplateData(templateName, licence, prisoner) {
    logger.info(`getTemplateData for '${templateName}'`)
    if (!requiredFields[templateName]) {
      logger.warn(`No such form template: ${templateName}`)
      return null
    }

    const required = requiredFields[templateName]

    const values = required.reduce((allValues, field) => {
      return mergeWithRight(allValues, { [field]: fieldValue(licence, prisoner, field) })
    }, {})

    logger.info(`getTemplateData for '${templateName}'. Extracted template data for ${Object.keys(values).join(', ')}`)
    return values
  }

  function getValue(data, path) {
    return getIn(data, path) || ''
  }

  function combine(data, paths, separator) {
    return (
      paths
        .map((path) => getIn(data, path))
        .filter(Boolean)
        .join(separator) || ''
    )
  }

  function getDateValue(data, path) {
    const value = getValue(data, path)
    if (moment(value, 'DD-MM-YYYY').isValid()) {
      return moment(value, 'DD-MM-YYYY').format(formsDateFormat)
    }
    return value
  }

  function pickFirst(reasons) {
    return Array.isArray(reasons) ? reasons[0] : reasons
  }

  function fieldValue(licence, prisoner, field) {
    const fieldFunction = {
      CREATION_DATE: () => moment().format(formsDateFormat),
      OFF_NAME: () => getOffenderName(prisoner),
      OFF_NOMS: () => getValue(prisoner, ['offenderNo']),
      EST_PREMISE: () => getValue(prisoner, ['agencyLocationDesc']),
      SENT_HDCED: () => getDateValue(prisoner, ['sentenceDetail', 'homeDetentionCurfewEligibilityDate']),
      SENT_HDCAD: () => getDateValue(prisoner, ['sentenceDetail', 'homeDetentionCurfewActualDate']),
      SENT_CRD: () => getDateValue(prisoner, ['sentenceDetail', 'releaseDate']),
      CURFEW_ADDRESS: () => getCurfewAddress(pdfFormatter.pickCurfewAddress(licence)),
      CURFEW_TELEPHONE: () => getCurfewTelephone(pdfFormatter.pickCurfewAddress(licence)),
      REFUSAL_REASON: () => getRefusalReason(licence),
      INELIGIBLE_REASON: () => getIneligibleReason(licence),
      UNSUITABLE_REASON: () => getUnsuitableReason(licence),
      CURFEW_HOURS: () => getValue(licence, ['curfew', 'curfewHours']),
      CURFEW_FIRST: () => getValue(licence, ['curfew', 'firstNight']),
    }

    if (!fieldFunction[field]) {
      logger.warn(`No field function for form field name: ${field}`)
      return null
    }

    return fieldFunction[field]()
  }

  function getOffenderName(prisonerInfo) {
    return combine(prisonerInfo, [['firstName'], ['middleName'], ['lastName']], ' ')
  }

  function getCurfewAddress(address) {
    return address ? combine(address, [['addressLine1'], ['addressLine2'], ['addressTown'], ['postCode']], '\n') : ''
  }

  function getCurfewTelephone(address) {
    return address ? address.telephone : ''
  }

  function getRefusalReason(licence) {
    const finalChecksReasons = ['finalChecks', 'refusal', 'reason']
    if (!isEmpty(getIn(licence, finalChecksReasons))) {
      return getReasonLabel(licence, finalChecksReasons, refusalReasonlabels)
    }

    return getReasonLabel(licence, ['approval', 'release', 'reason'], refusalReasonlabels)
  }

  function getIneligibleReason(licence) {
    return getReasonLabel(licence, ['eligibility', 'excluded', 'reason'], ineligibleReasonlabels)
  }

  function getUnsuitableReason(licence) {
    return getReasonLabel(licence, ['eligibility', 'suitability', 'reason'], unsuitableReasonlabels)
  }

  function getReasonLabel(licence, path, labels) {
    const reasons = getIn(licence, path)
    return labels[pickFirst(reasons)] || ''
  }

  async function getCurfewAddressCheckData({ agencyLocationId, licence, isBass, isAp, bookingId, token }) {
    const [conditions, prisoner, caMailboxes] = await Promise.all([
      conditionsServiceFactory.forVersion(CURRENT_CONDITION_VERSION).getFullTextForApprovedConditions(licence),
      prisonerService.getPrisonerDetails(bookingId, token),
      configClient.getMailboxes(agencyLocationId, 'CA'),
    ])

    if (isBass === undefined || isAp === undefined) {
      throw new Error('Missing mandatory input')
    }

    const prisonEmail = getIn(caMailboxes, [0, 'email']) || null

    const sentenceDetail = getIn(prisoner, ['sentenceDetail']) || {}
    const responsibleOfficer = getIn(prisoner, ['com']) || {}

    const curfewAddressDetails = getCurfewAddressDetails(isBass, isAp, licence)

    const reportingInstructions = getIn(licence, ['reporting', 'reportingInstructions']) || {}
    const riskManagement = getIn(licence, ['risk', 'riskManagement']) || {}
    const victimLiaison = getIn(licence, ['victim', 'victimLiaison']) || {}

    return {
      prisoner,
      sentenceDetail,
      isBass,
      isAp,
      ...curfewAddressDetails,
      prisonEmail,
      reportingInstructions,
      conditions,
      riskManagement,
      victimLiaison,
      responsibleOfficer,
    }
  }

  function getCurfewAddressDetails(isBass, isAp, licence) {
    if (isBass) {
      return {
        bassRequest: getIn(licence, ['bassReferral', 'bassRequest']) || {},
        bassAreaCheck: getIn(licence, ['bassReferral', 'bassAreaCheck']) || {},
      }
    }

    if (isAp) {
      return {
        approvedPremisesAddress: getIn(licence, ['curfew', 'approvedPremisesAddress']) || {},
      }
    }

    return {
      curfewAddress: getIn(licence, ['proposedAddress', 'curfewAddress']) || {},
      curfewAddressReview: getIn(licence, ['curfew', 'curfewAddressReview']) || {},
      occupier: getIn(licence, ['proposedAddress', 'curfewAddress', 'occupier']) || {},
    }
  }

  return {
    getTemplateData,
    getCurfewAddressCheckData,
  }
}

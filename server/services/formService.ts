import moment from 'moment'
import { isEmpty, getIn, mergeWithRight } from '../utils/functionalHelpers'
import config from '../config'
import {
  requiredFields,
  refusalReasonlabels,
  ineligibleReasonlabels,
  unsuitableReasonlabels,
  postponedReasonlabels,
} from './config/formConfig'
import logger from '../../log'
import type { PrisonerService } from './prisonerService'
import type { Licence } from '../data/licenceTypes'

const {
  pdf: {
    forms: { formsDateFormat },
  },
} = config

export default class FormService {
  constructor(
    private readonly pdfFormatter,
    private readonly prisonerService: PrisonerService,
    private readonly configClient
  ) {}

  async getTemplateData(templateName, licence, prisoner) {
    logger.info(`getTemplateData for '${templateName}'`)
    if (!requiredFields[templateName]) {
      logger.warn(`No such form template: ${templateName}`)
      return null
    }

    const required = requiredFields[templateName]

    const values = required.reduce((allValues, field) => {
      return mergeWithRight(allValues, { [field]: this.fieldValue(licence, prisoner, field) })
    }, {})

    logger.info(`getTemplateData for '${templateName}'. Extracted template data for ${Object.keys(values).join(', ')}`)
    return values
  }

  private getValue(data, path) {
    return getIn(data, path) || ''
  }

  private combine(data, paths, separator) {
    return (
      paths
        .map((path) => getIn(data, path))
        .filter(Boolean)
        .join(separator) || ''
    )
  }

  private getDateValue(data, path) {
    const value = this.getValue(data, path)
    if (moment(value, 'DD-MM-YYYY').isValid()) {
      return moment(value, 'DD-MM-YYYY').format(formsDateFormat)
    }
    return value
  }

  private pickFirst(reasons) {
    return Array.isArray(reasons) ? reasons[0] : reasons
  }

  private fieldValue(licence, prisoner, field) {
    const fieldFunction = {
      CREATION_DATE: () => moment().format(formsDateFormat),
      OFF_NAME: () => this.getOffenderName(prisoner),
      OFF_NOMS: () => this.getValue(prisoner, ['offenderNo']),
      EST_PREMISE: () => this.getValue(prisoner, ['agencyLocationDesc']),
      SENT_HDCED: () => this.getDateValue(prisoner, ['sentenceDetail', 'homeDetentionCurfewEligibilityDate']),
      SENT_HDCAD: () => this.getDateValue(prisoner, ['sentenceDetail', 'homeDetentionCurfewActualDate']),
      SENT_CRD: () => this.getDateValue(prisoner, ['sentenceDetail', 'releaseDate']),
      CURFEW_ADDRESS: () => this.getCurfewAddress(this.pdfFormatter.pickCurfewAddress(licence)),
      CURFEW_TELEPHONE: () => this.getCurfewTelephone(this.pdfFormatter.pickCurfewAddress(licence)),
      REFUSAL_REASON: () => this.getRefusalReason(licence),
      INELIGIBLE_REASON: () => this.getIneligibleReason(licence),
      UNSUITABLE_REASON: () => this.getUnsuitableReason(licence),
      POSTPONE_REASON: () => this.getPostponedReason(licence),
      CURFEW_HOURS: () => this.getValue(licence, ['curfew', 'curfewHours']),
      CURFEW_FIRST: () => this.getValue(licence, ['curfew', 'firstNight']),
    }

    if (!fieldFunction[field]) {
      logger.warn(`No field function for form field name: ${field}`)
      return null
    }

    return fieldFunction[field]()
  }

  private getOffenderName(prisonerInfo) {
    return this.combine(prisonerInfo, [['firstName'], ['middleName'], ['lastName']], ' ')
  }

  private getCurfewAddress(address) {
    return address
      ? this.combine(address, [['addressLine1'], ['addressLine2'], ['addressTown'], ['postCode']], '\n')
      : ''
  }

  private getCurfewTelephone(address) {
    return address ? address.telephone : ''
  }

  private getRefusalReason(licence) {
    const finalChecksReasons = ['finalChecks', 'refusal', 'reason']
    if (!isEmpty(getIn(licence, finalChecksReasons))) {
      return this.getReasonLabel(licence, finalChecksReasons, refusalReasonlabels)
    }

    return this.getReasonLabel(licence, ['approval', 'release', 'reason'], refusalReasonlabels)
  }

  private getIneligibleReason(licence) {
    return this.getReasonLabel(licence, ['eligibility', 'excluded', 'reason'], ineligibleReasonlabels)
  }

  private getUnsuitableReason(licence) {
    return this.getReasonLabel(licence, ['eligibility', 'suitability', 'reason'], unsuitableReasonlabels)
  }

  private getPostponedReason(licence) {
    return this.getReasonLabel(licence, ['finalChecks', 'postpone', 'postponeReason'], postponedReasonlabels)
  }

  private getReasonLabel(licence, path, labels) {
    const reasons = getIn(licence, path)
    return labels[this.pickFirst(reasons)] || ''
  }

  async getCurfewAddressCheckData({
    agencyLocationId,
    licence,
    isBass,
    isAp,
    bookingId,
    token,
  }: {
    agencyLocationId: number
    licence: Licence
    isBass: boolean
    isAp: boolean
    bookingId: number
    token: string
  }) {
    const [prisoner, caMailboxes] = await Promise.all([
      this.prisonerService.getPrisonerDetails(bookingId, token),
      this.configClient.getMailboxes(agencyLocationId, 'CA'),
    ])

    if (isBass === undefined || isAp === undefined) {
      throw new Error('Missing mandatory input')
    }

    const prisonEmail = getIn(caMailboxes, [0, 'email']) || null

    const sentenceDetail = getIn(prisoner, ['sentenceDetail']) || {}
    const responsibleOfficer = getIn(prisoner, ['com']) || {}

    const curfewAddressDetails = this.getCurfewAddressDetails(isBass, isAp, licence)

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
      riskManagement,
      victimLiaison,
      responsibleOfficer,
    }
  }

  private getCurfewAddressDetails(isBass, isAp, licence) {
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
}

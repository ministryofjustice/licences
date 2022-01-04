import ConditionsService from './conditionsService'
import { LicenceService } from './licenceService'
import { PrisonerService } from './prisonerService'

const versionInfo = require('../utils/versionInfo')
const { getIn } = require('../utils/functionalHelpers')

export default class PdfService {
  constructor(
    private readonly logger,
    private readonly licenceService: LicenceService,
    private readonly conditionsService: ConditionsService,
    private readonly prisonerService: PrisonerService,
    private readonly pdfFormatter
  ) {}

  async getPdfLicenceData(bookingId, rawLicence, token) {
    const [licence, prisonerInfo, establishment] = await Promise.all([
      this.conditionsService.populateLicenceWithConditions(rawLicence.licence),
      this.prisonerService.getPrisonerDetails(bookingId, token),
      this.prisonerService.getEstablishmentForPrisoner(bookingId, token),
    ])

    const image = prisonerInfo.facialImageId ? await this.getImage(prisonerInfo.facialImageId, token) : null

    return this.pdfFormatter.formatPdfData(
      getIn(licence, ['document', 'template', 'decision']),
      {
        licence,
        prisonerInfo,
        establishment,
      },
      image,
      { ...rawLicence.approvedVersionDetails, approvedVersion: rawLicence.approvedVersion }
    )
  }

  async updateLicenceType(rawLicence, bookingId, offenceCommittedBeforeCutoffDecision, templateId, postRelease) {
    const offenceCommittedBeforeFeb2015 = getIn(rawLicence, [
      'licence',
      'document',
      'template',
      'offenceCommittedBeforeFeb2015',
    ])
    const currentTemplateId = getIn(rawLicence, ['licence', 'document', 'template', 'decision'])

    if (offenceCommittedBeforeCutoffDecision === offenceCommittedBeforeFeb2015 && templateId === currentTemplateId) {
      return
    }

    await this.licenceService.update({
      bookingId,
      originalLicence: rawLicence,
      config: { fields: [{ decision: {} }, { offenceCommittedBeforeFeb2015: {} }], noModify: true },
      userInput: { decision: templateId, offenceCommittedBeforeFeb2015: offenceCommittedBeforeCutoffDecision },
      licenceSection: 'document',
      formName: 'template',
      postRelease,
    })
  }

  async getImage(facialImageId, token) {
    try {
      return await this.prisonerService.getPrisonerImage(facialImageId, token)
    } catch (error) {
      this.logger.error('Error during getPrisonerImage: ', error.stack)
      return null
    }
  }

  async checkAndTakeSnapshot(rawLicence, bookingId) {
    const { isNewTemplate, isNewVersion } = versionInfo(rawLicence)

    if (!(isNewVersion || isNewTemplate)) {
      return rawLicence
    }

    // Second argument is unnecessary. Sort that out later...
    await this.licenceService.saveApprovedLicenceVersion(
      bookingId,
      getIn(rawLicence, ['licence', 'document', 'template', 'decision'])
    )
    return this.licenceService.getLicence(bookingId)
  }
}

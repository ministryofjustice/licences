/**
 * @typedef {import("../services/prisonerService").PrisonerService} PrisonerService
 */
const versionInfo = require('../utils/versionInfo')
const { getIn } = require('../utils/functionalHelpers')

/**
 * @param {PrisonerService} prisonerService
 */
module.exports = function createPdfService(logger, licenceService, conditionsService, prisonerService, pdfFormatter) {
  async function getPdfLicenceData(bookingId, rawLicence, token) {
    const [licence, prisonerInfo, establishment] = await Promise.all([
      conditionsService.populateLicenceWithConditions(rawLicence.licence),
      prisonerService.getPrisonerDetails(bookingId, token),
      prisonerService.getEstablishmentForPrisoner(bookingId, token),
    ])

    const image = prisonerInfo.facialImageId ? await getImage(prisonerInfo.facialImageId, token) : null

    return pdfFormatter.formatPdfData(
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

  async function updateLicenceType(
    rawLicence,
    bookingId,
    offenceCommittedBeforeCutoffDecision,
    templateId,
    postRelease
  ) {
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

    await licenceService.update({
      bookingId,
      originalLicence: rawLicence,
      config: { fields: [{ decision: {} }, { offenceCommittedBeforeFeb2015: {} }], noModify: true },
      userInput: { decision: templateId, offenceCommittedBeforeFeb2015: offenceCommittedBeforeCutoffDecision },
      licenceSection: 'document',
      formName: 'template',
      postRelease,
    })
  }

  async function getImage(facialImageId, token) {
    try {
      return await prisonerService.getPrisonerImage(facialImageId, token)
    } catch (error) {
      logger.error('Error during getPrisonerImage: ', error.stack)
      return null
    }
  }

  async function checkAndTakeSnapshot(rawLicence, bookingId) {
    const { isNewTemplate, isNewVersion } = versionInfo(rawLicence)

    if (!(isNewVersion || isNewTemplate)) {
      return rawLicence
    }

    // Second argument is unnecessary. Sort that out later...
    await licenceService.saveApprovedLicenceVersion(
      bookingId,
      getIn(rawLicence, ['licence', 'document', 'template', 'decision'])
    )
    return licenceService.getLicence(bookingId)
  }

  return {
    updateLicenceType,
    checkAndTakeSnapshot,
    getPdfLicenceData,
  }
}

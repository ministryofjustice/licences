const superagent = require('superagent')
const config = require('../config')
const versionInfo = require('../utils/versionInfo')
const { replacePath, getIn } = require('../utils/functionalHelpers')

const pdfGenPath = `${config.pdf.pdfServiceHost}/generate`

module.exports = function createPdfService(logger, licenceService, conditionsService, prisonerService, pdfFormatter) {
  async function getPdfLicenceData(templateName, bookingId, rawLicence, token) {
    const [licence, prisonerInfo, establishment] = await Promise.all([
      conditionsService.populateLicenceWithConditions(rawLicence.licence),
      prisonerService.getPrisonerDetails(bookingId, token),
      prisonerService.getEstablishmentForPrisoner(bookingId, token),
    ])

    const image = prisonerInfo.facialImageId ? await getImage(prisonerInfo.facialImageId, token) : null

    return pdfFormatter.formatPdfData(
      templateName,
      {
        licence,
        prisonerInfo,
        establishment,
      },
      image,
      { ...rawLicence.approvedVersionDetails, approvedVersion: rawLicence.approvedVersion }
    )
  }

  async function getImage(facialImageId, token) {
    try {
      return await prisonerService.getPrisonerImage(facialImageId, token)
    } catch (error) {
      logger.error('Error during getPrisonerImage: ', error.stack)
      return null
    }
  }

  async function getPdf(templateName, values) {
    logger.info(`Creating PDF at URI '${pdfGenPath}' for template '${templateName}'`)

    try {
      const result = await superagent.post(pdfGenPath).send({
        templateName,
        values,
      })
      return Buffer.from(result.body)
    } catch (error) {
      logger.error('Error during generate PDF: ', error.stack)
      throw error
    }
  }

  async function generatePdf(templateName, bookingId, rawLicence, token, postRelease) {
    const versionedLicence = await checkAndUpdateVersion(rawLicence, bookingId, templateName, postRelease)

    const { values } = await getPdfLicenceData(templateName, bookingId, versionedLicence, token)

    const varyApprover = getIn(values, ['VARY_APPROVER'])
    const valuesWithApprover =
      postRelease && varyApprover !== pdfFormatter.DEFAULT_PLACEHOLDER
        ? replacePath(['APPROVER'], varyApprover, values)
        : values

    const template = `${postRelease ? 'vary_' : ''}${templateName}`

    return getPdf(template, valuesWithApprover)
  }

  async function checkAndUpdateVersion(rawLicence, bookingId, template, postRelease) {
    const { isNewTemplate, isNewVersion } = versionInfo(rawLicence, template)

    if (isNewTemplate) {
      await licenceService.update({
        bookingId,
        originalLicence: rawLicence,
        config: { fields: [{ decision: {} }], noModify: true },
        userInput: { decision: template },
        licenceSection: 'document',
        formName: 'template',
        postRelease,
      })
    }

    if (isNewVersion || isNewTemplate) {
      await licenceService.saveApprovedLicenceVersion(bookingId, template)
      return licenceService.getLicence(bookingId)
    }

    return rawLicence
  }

  return {
    getPdfLicenceData,
    getPdf,
    generatePdf,
  }
}

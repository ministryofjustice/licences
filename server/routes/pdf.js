/**
 * @typedef {import("../services/prisonerService").PrisonerService} PrisonerService
 */
const logger = require('../../log')
const { asyncMiddleware } = require('../utils/middleware')
const { templates, templatesForNewOffence } = require('./config/pdf')
const versionInfo = require('../utils/versionInfo')
const { firstItem, getIn, isEmpty } = require('../utils/functionalHelpers')
const {
  port,
  pdf: {
    licences: { pdfOptions },
  },
} = require('../config')

/**
 * @param {object} args
 * @param {any} args.pdfService
 * @param {PrisonerService} args.prisonerService
 */
module.exports = ({ pdfService, prisonerService }) => (router, audited) => {
  router.get(
    '/selectLicenceType/:bookingId',
    asyncMiddleware(async (req, res) => {
      const { bookingId } = req.params
      const prisoner = await prisonerService.getPrisonerPersonalDetails(bookingId, res.locals.token)
      const errors = firstItem(req.flash('errors')) || {}
      const licenceTemplateId = getIn(res.locals.licence.licence, ['document', 'template', 'decision'])
      const offenceCommittedBeforeFeb2015 = getIn(res.locals.licence.licence, [
        'document',
        'template',
        'offenceCommittedBeforeFeb2015',
      ])

      return res.render('pdf/selectLicenceType', {
        bookingId,
        templates,
        prisoner,
        errors,
        licenceTemplateId,
        offenceCommittedBeforeFeb2015,
      })
    })
  )

  router.post(
    '/selectLicenceType/:bookingId',
    asyncMiddleware(async (req, res) => {
      const { bookingId } = req.params
      const { offenceBeforeCutoff, licenceTypeRadio } = req.body
      const { licence, postRelease } = res.locals

      if (isEmpty(offenceBeforeCutoff)) {
        req.flash('errors', { offenceBefore: 'Select yes or no' })
        return res.redirect(`/hdc/pdf/selectLicenceType/${bookingId}`)
      }

      if (
        (offenceBeforeCutoff === 'No' && !templatesForNewOffence.includes(licenceTypeRadio)) ||
        (offenceBeforeCutoff === 'Yes' && !templates.map((t) => t.id).includes(licenceTypeRadio))
      ) {
        req.flash('errors', { licenceTypeRadioList: 'Select a licence type' })
        return res.redirect(`/hdc/pdf/selectLicenceType/${bookingId}`)
      }

      await pdfService.updateLicenceType(licence, bookingId, offenceBeforeCutoff, licenceTypeRadio, postRelease)

      return res.redirect(`/hdc/pdf/taskList/${bookingId}`)
    })
  )

  router.get(
    '/taskList/:bookingId',
    asyncMiddleware(async (req, res) => {
      const { bookingId } = req.params
      const { licence, token } = res.locals

      const templateName = getIn(licence.licence, ['document', 'template', 'decision'])
      const templateLabel = getTemplateLabel(templateName)

      if (!templateLabel) {
        throw new Error(`Invalid licence template name: ${templateName}`)
      }

      const [prisoner, { missing }] = await Promise.all([
        prisonerService.getPrisonerPersonalDetails(bookingId, token),
        pdfService.getPdfLicenceData(bookingId, licence, token),
      ])

      const postRelease = prisoner.agencyLocationId ? prisoner.agencyLocationId.toUpperCase() === 'OUT' : false

      const incompleteGroupsFilter = postRelease
        ? (group) => missing[group].mandatory || missing[group].mandatoryPostRelease
        : (group) => missing[group].mandatory || missing[group].mandatoryPreRelease

      const incompleteGroups = Object.keys(missing).filter(incompleteGroupsFilter)

      const incompletePreferredGroups = Object.keys(missing).filter((group) => missing[group].preferred)

      const canPrint = !incompleteGroups || isEmpty(incompleteGroups)

      return res.render('pdf/createLicenceTaskList', {
        bookingId,
        missing,
        templateName,
        prisoner,
        incompleteGroups,
        incompletePreferredGroups,
        canPrint,
        postRelease,
        versionInfo: versionInfo(licence),
      })
    })
  )

  router.get(
    '/missing/:section/:bookingId',
    asyncMiddleware(async (req, res) => {
      const { bookingId, section } = req.params
      const { licence } = res.locals
      logger.debug(`GET pdf/missing/${section}/${bookingId}`)

      const templateName = getIn(licence.licence, ['document', 'template', 'decision'])

      const [prisoner, { missing }] = await Promise.all([
        prisonerService.getPrisonerPersonalDetails(bookingId, res.locals.token),
        pdfService.getPdfLicenceData(bookingId, licence, res.locals.token),
      ])

      const data = {}

      return res.render(`pdf/missing/${section}`, {
        bookingId,
        missing,
        templateName,
        prisoner,
        data,
      })
    })
  )

  router.get(
    '/create/:bookingId',
    audited,
    asyncMiddleware(async (req, res) => {
      const { bookingId } = req.params
      const { licence, postRelease, token } = res.locals
      logger.debug(`GET pdf/create/${bookingId}`)

      const templateName = getIn(licence.licence, ['document', 'template', 'decision'])

      const updatedDecoratedLicence = await pdfService.checkAndTakeSnapshot(licence, bookingId)
      const pdfData = await pdfService.getPdfLicenceData(bookingId, updatedDecoratedLicence, token)

      const filename = `${pdfData.values.OFF_NOMS}.pdf`
      const headerTemplate = getHeader(pdfData)
      const footerTemplate = getFooter(pdfData, templateName)
      const qualifiedTemplateName = `${postRelease ? 'vary_' : ''}${templateName}`

      return res.renderPDF(
        `licences/${qualifiedTemplateName}`,
        { port, ...pdfData.values },
        { filename, pdfOptions: { ...pdfOptions, headerTemplate, footerTemplate } }
      )
    })
  )

  return router
}

const licencePdfHeaderFooterStyle =
  'font-family: Arial; font-size: 10px; font-weight: bold; width: 100%; height: 15px; text-align: center; padding: 10px;'

function getHeader(pdfData) {
  return `
    <span style="${licencePdfHeaderFooterStyle}">
      <table style="width: 100%; padding-left: 30px;">
        <tr>
          <td style="text-align: center;">Name: ${pdfData.values.OFF_NAME}</td>
          <td style="text-align: center;">Prison no: ${pdfData.values.OFF_NOMS}</td>
          <td style="text-align: center;">Date of Birth: ${pdfData.values.OFF_DOB}</td>
        </tr>
      </table>
    </span>`
}

function getFooter(pdfData, templateName) {
  const templateLabel = getTemplateVersionLabel(templateName)
  return `
      <span style="${licencePdfHeaderFooterStyle}">
        Version: ${pdfData.values.VERSION_NUMBER}, ${pdfData.values.VERSION_DATE}
        <br/>
        Page <span class="pageNumber"></span> of <span class="totalPages"></span> - ${templateLabel}
      </span>`
}

function getTemplateLabel(templateName) {
  const templateConfig = templates.find((template) => template.id === templateName)
  return getIn(templateConfig, ['label'])
}

function getTemplateVersionLabel(templateName) {
  const { label, version } = templates.find((template) => template.id === templateName)
  return [label, version].join(' v')
}

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

module.exports = ({ pdfService, prisonerService }) => (router, audited) => {
  router.get(
    '/select/:bookingId',
    asyncMiddleware(async (req, res) => {
      const { bookingId } = req.params

      const prisoner = await prisonerService.getPrisonerPersonalDetails(bookingId, res.locals.token)
      const errors = firstItem(req.flash('errors')) || {}

      const lastTemplate = getIn(res.locals.licence, ['approvedVersionDetails', 'template'])

      return res.render('pdf/select', { bookingId, templates, prisoner, errors, lastTemplate })
    })
  )

  router.post('/select/:bookingId', (req, res) => {
    const { bookingId } = req.params
    const { decision } = req.body

    const templateIds = templates.map(template => template.id)

    if (decision === '' || !templateIds.includes(decision)) {
      req.flash('errors', { decision: 'Select a licence type' })
      return res.redirect(`/hdc/pdf/select/${bookingId}`)
    }

    res.redirect(`/hdc/pdf/taskList/${decision}/${bookingId}`)
  })

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

      if (offenceBeforeCutoff === undefined || offenceBeforeCutoff === '') {
        req.flash('errors', { offenceBefore: 'Select yes or no' })
        return res.redirect(`/hdc/pdf/selectLicenceType/${bookingId}`)
      }

      if (
        beforeLicenceTypeNotSelected(offenceBeforeCutoff, licenceTypeRadio) ||
        afterLicenceTypeNotSelected(offenceBeforeCutoff, licenceTypeRadio)
      ) {
        req.flash('errors', { licenceTypeRadioList: 'Select a licence type' })
        const { licence } = res.locals
        await Promise.all([
          pdfService.updateOffenceCommittedBefore(licence, bookingId, offenceBeforeCutoff, '', res.locals.token),
        ])
        return res.redirect(`/hdc/pdf/selectLicenceType/${bookingId}`)
      }

      res.redirect(`/hdc/pdf/taskList/${licenceTypeRadio}/${offenceBeforeCutoff}/${bookingId}`)
    })
  )

  router.get(
    '/taskList/:templateName/:offenceBeforeCutoff/:bookingId',
    asyncMiddleware(async (req, res) => {
      const { bookingId, templateName, offenceBeforeCutoff } = req.params
      const { licence } = res.locals

      const templateLabel = getTemplateLabel(templateName)

      if (!templateLabel) {
        throw new Error(`Invalid licence template name: ${templateName}`)
      }

      const [prisoner, { missing }] = await Promise.all([
        prisonerService.getPrisonerPersonalDetails(bookingId, res.locals.token),
        pdfService.getPdfLicenceDataAndUpdateLicenceType(
          templateName,
          offenceBeforeCutoff,
          bookingId,
          licence,
          res.locals.token
        ),
      ])
      const postRelease = prisoner.agencyLocationId ? prisoner.agencyLocationId.toUpperCase() === 'OUT' : false
      const groupsRequired = postRelease ? 'mandatoryPostRelease' : 'mandatory'

      const incompleteGroups = Object.keys(missing).filter(group => missing[group][groupsRequired])
      const incompletePreferredGroups = Object.keys(missing).filter(group => missing[group].preferred)

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
        versionInfo: versionInfo(licence, templateName),
      })
    })
  )

  router.get(
    '/taskList/:templateName/:bookingId',
    asyncMiddleware(async (req, res) => {
      const { bookingId, templateName } = req.params
      const { licence } = res.locals
      logger.debug(`GET pdf/taskList/${templateName}/${bookingId}`)

      const templateLabel = getTemplateLabel(templateName)

      if (!templateLabel) {
        throw new Error(`Invalid licence template name: ${templateName}`)
      }

      const [prisoner, { missing }] = await Promise.all([
        prisonerService.getPrisonerPersonalDetails(bookingId, res.locals.token),
        pdfService.getPdfLicenceData(templateName, bookingId, licence, res.locals.token),
      ])
      const postRelease = prisoner.agencyLocationId ? prisoner.agencyLocationId.toUpperCase() === 'OUT' : false
      const groupsRequired = postRelease ? 'mandatoryPostRelease' : 'mandatory'

      const incompleteGroups = Object.keys(missing).filter(group => missing[group][groupsRequired])
      const incompletePreferredGroups = Object.keys(missing).filter(group => missing[group].preferred)

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
        versionInfo: versionInfo(licence, templateName),
      })
    })
  )

  router.get(
    '/missing/:section/:templateName/:bookingId',
    asyncMiddleware(async (req, res) => {
      const { bookingId, templateName, section } = req.params
      const { licence } = res.locals
      logger.debug(`GET pdf/missing/${section}/${templateName}/${bookingId}`)

      const [prisoner, { missing }] = await Promise.all([
        prisonerService.getPrisonerPersonalDetails(bookingId, res.locals.token),
        pdfService.getPdfLicenceData(templateName, bookingId, licence, res.locals.token),
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
    '/create/:templateName/:bookingId',
    audited,
    asyncMiddleware(async (req, res) => {
      const { bookingId, templateName } = req.params
      const { licence, postRelease, token } = res.locals
      logger.debug(`GET pdf/create/${templateName}/${bookingId}`)

      const pdfData = await pdfService.getPdfLicenceData(templateName, bookingId, licence, token, postRelease)

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
  const templateConfig = templates.find(template => template.id === templateName)
  return getIn(templateConfig, ['label'])
}

function getTemplateVersionLabel(templateName) {
  const { label, version } = templates.find(template => template.id === templateName)
  return [label, version].join(' v')
}

function beforeLicenceTypeNotSelected(offenceBeforeCutoff, licenceTypeRadio) {
  return offenceBeforeCutoff === 'Yes' && (licenceTypeRadio === undefined || licenceTypeRadio === '')
}

function afterLicenceTypeNotSelected(offenceBeforeCutoff, licenceTypeRadio) {
  return (
    offenceBeforeCutoff === 'No' &&
    (licenceTypeRadio === undefined || licenceTypeRadio === '' || !templatesForNewOffence.includes(licenceTypeRadio))
  )
}

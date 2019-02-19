const logger = require('../../log')
const { asyncMiddleware } = require('../utils/middleware')
const { templates } = require('./config/pdf')
const versionInfo = require('../utils/versionInfo')
const { firstItem, getIn, isEmpty } = require('../utils/functionalHelpers')

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

  function getTemplateLabel(templateName) {
    const templateConfig = templates.find(template => template.id === templateName)
    return getIn(templateConfig, ['label'])
  }

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
      const { licence, postRelease } = res.locals
      logger.debug(`GET pdf/create/${bookingId}/${templateName}`)

      const pdf = await pdfService.generatePdf(templateName, bookingId, licence, res.locals.token, postRelease)

      res.type('application/pdf')
      return res.end(pdf, 'binary')
    })
  )

  return router
}

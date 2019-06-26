const moment = require('moment')
const { asyncMiddleware } = require('../utils/middleware')
const { formTemplates, formsDateFormat, pdfOptions, domain } = require('../config')
const { isEmpty } = require('../utils/functionalHelpers')

module.exports = ({ formService, conditionsService, prisonerService, configClient }) => router => {
  router.get(
    '/curfewAddress/:bookingId',
    asyncMiddleware(async (req, res) => {
      const { bookingId } = req.params
      const {
        prisoner,
        licence: { licence },
        licenceStatus,
      } = res.locals

      const [fullLicence, standardConditions, fullPrisoner, ro, ca] = await Promise.all([
        conditionsService.populateLicenceWithApprovedConditions(licence),
        conditionsService.getStandardConditions(),
        prisonerService.getPrisonerDetails(bookingId, req.user.token),
        prisonerService.getResponsibleOfficer(bookingId, req.user.token),
        configClient.getMailboxes(prisoner.agencyLocationId, 'CA'),
      ])

      return res.renderPDF(
        'forms/curfewAddress',
        {
          prisoner: fullPrisoner,
          licence: fullLicence,
          standardConditions,
          isBass: licenceStatus.decisions.bassReferralNeeded,
          ro,
          ca: ca[0] || {},
          domain,
          completionDate: moment().format(formsDateFormat),
        },
        { filename: `${fullPrisoner.offenderNo}.pdf`, pdfOptions }
      )
    })
  )

  router.get(
    '/:templateName/:bookingId',
    asyncMiddleware(async (req, res) => {
      const { templateName } = req.params
      const {
        licence: { licence },
        prisoner,
      } = res.locals

      if (isEmpty(formTemplates[templateName])) {
        throw new Error(`unknown form template: ${templateName}`)
      }

      const pageData = await formService.getTemplateData(templateName, licence, prisoner)

      res.renderPDF(
        `forms/${templateName}`,
        { ...pageData, domain },
        { filename: `${prisoner.offenderNo}.pdf`, pdfOptions }
      )
    })
  )

  router.get(
    '/:bookingId',
    asyncMiddleware(async (req, res) => {
      const { bookingId } = req.params
      return res.render('forms/all', { bookingId, forms: Object.entries(formTemplates) })
    })
  )

  return router
}

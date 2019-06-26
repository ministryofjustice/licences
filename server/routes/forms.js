const moment = require('moment')
const { asyncMiddleware } = require('../utils/middleware')
const { formTemplates, formsDateFormat, pdfOptions, domain } = require('../config')
const { isEmpty, getIn } = require('../utils/functionalHelpers')

module.exports = ({ formService }) => router => {
  router.get(
    '/curfewAddress/:bookingId',
    asyncMiddleware(async (req, res) => {
      const { bookingId } = req.params
      const {
        prisoner,
        licence: { licence },
        licenceStatus,
      } = res.locals

      const isBass = getIn(licenceStatus, ['decisions', 'bassReferralNeeded'])

      const pageData = await formService.getCurfewAddressCheckData(
        prisoner.agencyLocationId,
        licence,
        isBass,
        bookingId,
        res.locals.token
      )

      const completionDate = moment().format(formsDateFormat)
      const filename = `${prisoner.offenderNo}.pdf`

      return res.renderPDF('forms/curfewAddress', { ...pageData, domain, completionDate }, { filename, pdfOptions })
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

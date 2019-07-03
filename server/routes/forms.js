const moment = require('moment')
const { asyncMiddleware } = require('../utils/middleware')
const { formTemplates, formsDateFormat, pdfOptions, domain } = require('../config')
const { curfewAddressCheckFormFileName } = require('./utils/pdfUtils')
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
      const isAp = getIn(licenceStatus, ['decisions', 'approvedPremisesRequired'])

      const pageData = await formService.getCurfewAddressCheckData({
        agencyLocationId: prisoner.agencyLocationId,
        licence,
        isBass,
        isAp,
        bookingId,
        token: res.locals.token,
      })

      const completionDate = moment().format(formsDateFormat)
      const filename = curfewAddressCheckFormFileName(prisoner)

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
      const filename = `${prisoner.offenderNo}.pdf`
      return res.renderPDF(`forms/${templateName}`, { ...pageData, domain }, { filename, pdfOptions })
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

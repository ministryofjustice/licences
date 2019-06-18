const { asyncMiddleware } = require('../utils/middleware')
const { formTemplates, pdfOptions, domain } = require('../config')
const { isEmpty } = require('../utils/functionalHelpers')

module.exports = ({ formService }) => router => {
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

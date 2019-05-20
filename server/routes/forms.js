const { asyncMiddleware } = require('../utils/middleware')
const { formTemplates } = require('../config')

module.exports = ({ formService }) => router => {
  router.get(
    '/:templateName/:bookingId',
    asyncMiddleware(async (req, res) => {
      const { templateName } = req.params
      const {
        licence: { licence },
        prisoner,
      } = res.locals

      if (!formTemplates.includes(templateName)) {
        throw new Error(`unknown form template: ${templateName}`)
      }

      const pdf = await formService.generatePdf(templateName, licence, prisoner)

      res.type('application/pdf')
      return res.end(pdf, 'binary')
    })
  )

  router.get(
    '/:bookingId',
    asyncMiddleware(async (req, res) => {
      const { bookingId } = req.params
      return res.render('forms/all', { bookingId })
    })
  )

  return router
}

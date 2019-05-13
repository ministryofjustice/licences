const { asyncMiddleware } = require('../utils/middleware')

module.exports = ({ formService }) => router => {
  router.get(
    '/:templateName/:bookingId',
    asyncMiddleware(async (req, res) => {
      const { templateName } = req.params
      const {
        licence: { licence },
        prisoner,
      } = res.locals

      const pdf = await formService.generatePdf(templateName, licence, prisoner)

      res.type('application/pdf')
      return res.end(pdf, 'binary')
    })
  )

  return router
}

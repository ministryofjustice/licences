/**
 * @typedef {import("../../../types/licences").LduService} LduService
 */
const { asyncMiddleware, authorisationMiddleware } = require('../../utils/middleware')

/**
 *  @param {LduService} lduService
 */
module.exports = lduService => (router, audited) => {
  router.use(authorisationMiddleware)

  router.get(
    '/probation-areas',
    asyncMiddleware(async (req, res) => {
      const probationAreas = await lduService.getAllProbationAreas()
      res.send(probationAreas)
    })
  )

  router.get(
    '/probation-areas/:probationAreaCode/local-delivery-units',
    asyncMiddleware(async (req, res) => {
      const ldus = await lduService.getLdusForProbationArea(req.params.probationAreaCode)
      res.send(ldus)
    })
  )

  router.post(
    '/probation-areas/:probationAreaCode/local-delivery-units/active',
    audited,
    asyncMiddleware(async (req, res) => {
      const { activeLdus } = req.body
      const { probationAreaCode } = req.params

      await lduService.updateActiveLdus(probationAreaCode, activeLdus)
      res.redirect(`/admin/locations/probation-areas/${probationAreaCode}/local-delivery-units/active`)
    })
  )

  return router
}

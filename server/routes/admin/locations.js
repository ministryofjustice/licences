/**
 * @typedef {import("../../../types/licences").LduService} LduService
 */
const { asyncMiddleware, authorisationMiddleware } = require('../../utils/middleware')

/**
 *  @param {LduService} lduService
 */
module.exports = (lduService) => (router, audited) => {
  router.use(authorisationMiddleware)

  router.get(
    '/probation-areas',
    asyncMiddleware(async (req, res) => {
      const probationAreas = await lduService.getAllProbationAreas()
      res.render('admin/locations/probationAreas', { probationAreas })
    })
  )

  router.get(
    '/probation-areas/:probationAreaCode/local-delivery-units',
    asyncMiddleware(async (req, res) => {
      const probationArea = (await lduService.getProbationArea(req.params.probationAreaCode)) || {}
      res.render('admin/locations/ldus', { probationArea, msg: req.flash('success') })
    })
  )

  router.post(
    '/probation-areas/:probationAreaCode/local-delivery-units',
    audited,
    asyncMiddleware(async (req, res) => {
      const { activeLdus = [] } = req.body
      const { probationAreaCode } = req.params
      await lduService.updateActiveLdus(probationAreaCode, activeLdus)
      req.flash('success', 'Update successful')
      res.redirect(`/admin/locations/probation-areas/${probationAreaCode}/local-delivery-units`)
    })
  )

  return router
}

const { asyncMiddleware } = require('../utils/middleware')

module.exports = ({ lduService }) => router => {
  router.get(
    '/all-probation-areas',
    asyncMiddleware(async (req, res) => {
      const probationAreas = await lduService.getAllProbationAreas()
      res.send(probationAreas)
    })
  )

  router.get(
    '/all-ldus/:probationAreaCode',
    asyncMiddleware(async (req, res) => {
      const ldus = await lduService.getLdusForProbationArea(req.params.probationAreaCode)
      res.send(ldus)
    })
  )

  router.get(
    '/active-ldus/:probationAreaCode',
    asyncMiddleware(async (req, res) => {
      const ldus = await lduService.getActiveLdusForProbationArea(req.params.probationAreaCode)
      res.send(ldus)
    })
  )

  router.post(
    '/update-active-ldus',
    asyncMiddleware(async (req, res) => {
      const { probationAreaCode, activeLdus } = req.body

      if (await lduService.updateActiveLdus(probationAreaCode, activeLdus)) {
        res.redirect(`/areas-and-ldus/update-active-ldus/${probationAreaCode}`)
      } else {
        res.send('TODO: error occurred, need to render the same page with error message')
      }
    })
  )

  return router
}

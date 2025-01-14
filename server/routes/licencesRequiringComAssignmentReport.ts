import { asyncMiddleware } from '../utils/middleware'

export = (licenceSearchService) => (router) => {
  router.get(
    '/',
    asyncMiddleware(async (req, res) => {
      return res.render('licencesRequiringComAssignmentReport', {})
    })
  )

  router.post(
    '/',
    asyncMiddleware(async (req, res) => {
      const licencesRequiringComAssignment = await licenceSearchService.getLicencesRequiringComAssignment(
        req.user.username,
        res.locals.user.activeCaseLoadId
      )
      res.contentType('text/csv')
      res.set('Content-Disposition', `attachment;filename=HDC12 no COM assigned.csv`)
      res.send(licencesRequiringComAssignment)
    })
  )

  return router
}

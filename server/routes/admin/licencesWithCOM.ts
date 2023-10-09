import { asyncMiddleware, authorisationMiddleware } from '../../utils/middleware'

export = (licenceSearchService) => (router) => {
  router.use(authorisationMiddleware)

  router.get(
    '/',
    asyncMiddleware(async (req, res) => {
      return res.render('admin/licences/licencesWithCOMDownload', {})
    })
  )

  router.post(
    '/',
    asyncMiddleware(async (req, res) => {
      const licenceswithCOM = await licenceSearchService.getLicencesInStageCOM(req.user.username)
      res.contentType('text/csv')
      res.set('Content-Disposition', `attachment;filename=licences-with-com.csv`)
      res.send(licenceswithCOM)
    })
  )

  return router
}

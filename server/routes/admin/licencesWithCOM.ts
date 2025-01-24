import { asyncMiddleware, authorisationMiddleware } from '../../utils/middleware'

export = (reportsService) => (router) => {
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
      const licenceswithCOM = await reportsService.getLicencesInStageCOM(req.user.username)
      res.contentType('text/csv')
      res.set('Content-Disposition', `attachment;filename=HDC-cases-with-COM.csv`)
      res.send(licenceswithCOM)
    })
  )

  return router
}

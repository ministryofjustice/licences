import { asyncMiddleware, authorisationMiddleware } from '../../utils/middleware'

export = (licenceSearchService, audit) => (router) => {
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
      const { username } = req.user
      const licenceswithCOM = await licenceSearchService.getLicencesInStageCOM(req.user.username)
      res.contentType('text/csv')
      res.set('Content-Disposition', `attachment;filename=HDC-cases-with-COM.csv`)
      res.send(licenceswithCOM)
      await audit.record('LICENCE_STAGE_COM_DOWNLOAD', username)
    })
  )

  return router
}

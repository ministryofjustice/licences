import { asyncMiddleware, authorisationMiddleware } from '../../utils/middleware'

export = (reportsService, audit) => (router) => {
  router.use(authorisationMiddleware)

  router.get(
    '/',
    asyncMiddleware(async (req, res) => {
      return res.render('admin/reports/licencesWithCOMDownload', {})
    })
  )

  router.post(
    '/',
    asyncMiddleware(async (req, res) => {
      const licenceswithCOM = await reportsService.getLicencesInStageCOM(req.user.username)
      res.contentType('text/csv')
      res.set('Content-Disposition', `attachment;filename=HDC-cases-with-COM.csv`)
      res.send(licenceswithCOM)
      await audit.record('LICENCE_STAGE_COM_DOWNLOAD', req.user.username)
    })
  )

  return router
}

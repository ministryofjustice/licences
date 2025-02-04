import moment from 'moment'
import { asyncMiddleware, authorisationMiddleware } from '../../utils/middleware'

export = (reportsService, audit) => (router) => {
  router.use(authorisationMiddleware)

  router.get(
    '/',
    asyncMiddleware(async (req, res) => {
      return res.render('admin/reports/licencesWithCADownload', {})
    })
  )

  router.post(
    '/',
    asyncMiddleware(async (req, res) => {
      const timestamp = moment().format('YYYY-MM-DD_HHmm')
      const licenceswithCOM = await reportsService.getLicencesWithAndWithoutComAssignment(req.user.username)
      res.contentType('text/csv')
      res.set('Content-Disposition', `attachment;filename=HDC12 national report - ${timestamp}.csv`)
      res.send(licenceswithCOM)
      await audit.record('LICENCE_STAGE_CA_DOWNLOAD', req.user.username)
    })
  )

  return router
}

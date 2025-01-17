import moment from 'moment'
import { asyncMiddleware } from '../utils/middleware'

export = (licenceSearchService, audit) => (router) => {
  router.get(
    '/',
    asyncMiddleware(async (req, res) => {
      return res.render('licencesRequiringComAssignmentReport', {})
    })
  )

  router.post(
    '/',
    asyncMiddleware(async (req, res) => {
      const prisonId = res.locals.user.activeCaseLoadId
      const timestamp = moment().format('YYYY-MM-DD_HHmm')
      const { username } = req.user
      const licencesRequiringComAssignment = await licenceSearchService.getLicencesRequiringComAssignment(
        username,
        prisonId
      )
      res.contentType('text/csv')
      res.set('Content-Disposition', `attachment;filename=HDC12 no COM assigned - ${prisonId} - ${timestamp}.csv`)
      res.send(licencesRequiringComAssignment)
      await audit.addItem('LICENCES_REQUIRING_COM_DOWNLOAD', username, { prisonId })
    })
  )

  return router
}

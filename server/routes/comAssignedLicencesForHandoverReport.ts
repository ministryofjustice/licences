import moment from 'moment'
import { asyncMiddleware } from '../utils/middleware'

export = (licenceSearchService, audit) => (router) => {
  router.get(
    '/',
    asyncMiddleware(async (req, res) => {
      return res.render('comAssignedLicencesForHandoverReport', {})
    })
  )

  router.post(
    '/',
    asyncMiddleware(async (req, res) => {
      const prisonId = res.locals.user.activeCaseLoadId
      const timestamp = moment().format('YYYY-MM-DD_HHmm')
      const { username } = req.user
      const comAssignedEligibleLicencesForHandover = await licenceSearchService.getComAssignedLicencesForHandover(
        username,
        prisonId
      )
      res.contentType('text/csv')
      res.set(
        'Content-Disposition',
        `attachment;filename=HDC12 COM assigned but with CA - ${prisonId} - ${timestamp}.csv`
      )
      res.send(comAssignedEligibleLicencesForHandover)
      await audit.record('COM_ASSIGNED_LICENCES_FOR_HANDOVER_DOWNLOAD', username, { prisonId })
    })
  )

  return router
}

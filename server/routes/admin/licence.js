const moment = require('moment')
const setCase = require('case')

const { asyncMiddleware, authorisationMiddleware } = require('../../utils/middleware')

module.exports = (licenceService, signInService, prisonerService, audit) => router => {
  router.use(authorisationMiddleware)

  const formatEvent = event => ({
    id: event.id,
    user: event.user,
    action: setCase.sentence(event.action),
    type: event.action,
    timestamp: moment(event.timestamp).format('dddd Do MMMM HH:mm:ss'),
    details: event.details,
    detailsJson: JSON.stringify(event.details, null, 4),
  })

  router.get(
    '/:abookingId',
    asyncMiddleware(async (req, res) => {
      const { abookingId: bookingId } = req.params
      const licence = await licenceService.getLicence(bookingId)
      const systemToken = await signInService.getClientCredentialsTokens(req.user.username)
      const prisonerInfo = await prisonerService.getPrisonerDetails(bookingId, systemToken.token)
      const events = await audit.getEventsForBooking(bookingId)
      return res.render('admin/licences/view', { bookingId, licence, prisonerInfo, events: events.map(formatEvent) })
    })
  )

  router.get(
    '/events/:eventId/raw',
    asyncMiddleware(async (req, res) => {
      const { eventId } = req.params
      const event = await audit.getEvent(eventId)
      return res.render('admin/licences/event', { event: formatEvent(event) })
    })
  )

  return router
}

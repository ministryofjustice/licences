const moment = require('moment')
const setCase = require('case')
const { unwrapResult, firstItem } = require('../../utils/functionalHelpers')
const transitionsForDestinations = require('../../services/notifications/transitionsForDestinations')

const { asyncMiddleware, authorisationMiddleware } = require('../../utils/middleware')

module.exports = (licenceService, signInService, prisonerService, audit, roNotificationHandler) => router => {
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
      const errors = firstItem(req.flash('errors')) || {}
      return res.render('admin/licences/view', {
        bookingId,
        licence: licence || {},
        prisonerInfo,
        events: events.map(formatEvent),
        errors,
      })
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

  router.get(
    '/:abookingId/notifyRo',
    asyncMiddleware(async (req, res) => {
      const { abookingId: bookingId } = req.params
      const licence = await licenceService.getLicence(bookingId)
      const systemToken = await signInService.getClientCredentialsTokens(req.user.username)
      const prisonerInfo = await prisonerService.getPrisonerDetails(bookingId, systemToken.token)
      return res.render('admin/licences/notify', { bookingId, licence, prisonerInfo })
    })
  )

  router.post(
    '/:abookingId/notifyRo',
    asyncMiddleware(async (req, res) => {
      const { abookingId: bookingId } = req.params
      const systemToken = await signInService.getClientCredentialsTokens(req.user.username)
      const [_, error] = unwrapResult(
        await roNotificationHandler.sendRoEmail({
          transition: transitionsForDestinations.addressReview,
          bookingId,
          token: systemToken.token,
          user: req.user,
        })
      )

      if (error) {
        req.flash('errors', { notifyError: error.message })
      }
      return res.redirect(`/admin/licences/${bookingId}`)
    })
  )

  return router
}

import moment from 'moment'
import setCase from 'case'
import { unwrapResult, firstItem, sortKeys } from '../../utils/functionalHelpers'
import transitionsForDestinations from '../../services/notifications/transitionsForDestinations'
import getLicenceStatus from '../../services/licence/licenceStatus'

const { asyncMiddleware, authorisationMiddleware } = require('../../utils/middleware')

export = (licenceService, signInService, prisonerService, audit, roNotificationHandler) => (router) => {
  router.use(authorisationMiddleware)

  const formatEvent = (event) => ({
    id: event.id,
    user: event.user,
    action: setCase.sentence(event.action),
    type: event.action,
    timestamp: moment(event.timestamp).format('DD/MM/YYYY HH:mm:ss'),
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
    '/:abookingId/raw',
    asyncMiddleware(async (req, res) => {
      const { abookingId: bookingId } = req.params
      const licence = await licenceService.getLicence(bookingId)
      const status = getLicenceStatus(licence)

      return res.render('admin/licences/raw', {
        bookingId,
        licence: JSON.stringify(sortKeys(licence), null, 4),
        status: JSON.stringify(sortKeys(status), null, 4),
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
      const [ignored, error] = unwrapResult(
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

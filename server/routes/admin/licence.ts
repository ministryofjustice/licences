import moment from 'moment'
import setCase from 'case'
import { firstItem, sortKeys, unwrapResult } from '../../utils/functionalHelpers'
import transitionsForDestinations from '../../services/notifications/transitionsForDestinations'
import getLicenceStatus from '../../services/licence/licenceStatus'

const { asyncMiddleware, authorisationMiddleware } = require('../../utils/middleware')

export = (licenceService, signInService, prisonerService, audit, roNotificationHandler, nomisPushService) =>
  (router) => {
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
        const prisonerInfo = await prisonerService.getPrisonerDetails(bookingId, systemToken)
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
        const prisonerInfo = await prisonerService.getPrisonerDetails(bookingId, systemToken)
        return res.render('admin/licences/notify', { bookingId, licence, prisonerInfo })
      })
    )

    router.get(
      '/events/:abookingId/reset-licence',
      asyncMiddleware(async (req, res) => {
        const bookingId = req.params.abookingId
        const systemToken = await signInService.getClientCredentialsTokens(req.user.username)
        const prisonerInfo = await prisonerService.getPrisonerDetails(bookingId, systemToken)
        const flash = req.flash('errorObject')
        const errorObject = flash[0] || {}

        res.render('admin/licences/resetLicence', { prisonerInfo, errorObject })
      })
    )

    router.post(
      '/events/:abookingId/reset-licence',
      asyncMiddleware(async (req, res) => {
        const bookingId = req.params.abookingId
        const { reset } = req.body
        const { username } = req.user

        if (!reset) {
          req.flash('errorObject', { reset: 'Select Yes or No' })
          return res.redirect(`/admin/licences/events/${bookingId}/reset-licence`)
        }

        if (reset === 'Yes') {
          await licenceService.resetLicence(bookingId)
          await audit.record('RESET', username, { bookingId })
          await nomisPushService.resetHDC(bookingId, username)
        }
        return res.redirect(`/admin/licences/${bookingId}`)
      })
    )

    router.post(
      '/:abookingId/notifyRo',
      asyncMiddleware(async (req, res) => {
        const { abookingId: bookingId } = req.params
        const systemToken = await signInService.getClientCredentialsTokens(req.user.username)
        const [, error] = unwrapResult(
          await roNotificationHandler.sendRoEmail({
            transition: transitionsForDestinations.addressReview,
            bookingId,
            token: systemToken,
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

/**
 * @typedef {import("../services/prisonerService").PrisonerService} PrisonerService
 */
const { asyncMiddleware } = require('../utils/middleware')
const transitionsForDestinations = require('../services/notifications/transitionsForDestinations')

/**
 * @param {object} args
 * @param {PrisonerService} args.prisonerService
 * @param {any} args.notificationService
 * @param {import('../services/hdc/hdcService').HdcService} args.hdcService
 */
module.exports =
  ({ prisonerService, notificationService, hdcService }) =>
  (router) => {
    router.get('/:destination/:bookingId', async (req, res) => {
      const { destination, bookingId } = req.params
      const transition = transitionsForDestinations[destination]
      const submissionTarget = await prisonerService.getOrganisationContactDetails(
        transition.receiver,
        bookingId,
        res.locals.token
      )

      res.render(`send/${transition.type}`, { bookingId, submissionTarget })
    })

    router.post(
      '/:destination/:bookingId',
      asyncMiddleware(async (req, res) => {
        const { destination, bookingId } = req.params
        const { token, licence, prisoner } = res.locals
        const transition = transitionsForDestinations[destination]

        await notificationService.send({
          transition,
          bookingId,
          token,
          licence,
          prisoner,
          user: req.user,
        })

        if (transition.sender === 'RO' && transition.receiver === 'CA') {
          await hdcService.postCvlEvent({
            eventType: 'COM_COMPLETES_ADDRESS_CHECKS',
            bookingId: parseInt(bookingId, 10),
            licenceId: licence.id,
            nomsNumber: prisoner.offenderNo,
            triggeredBy: req.user.username,
            reason: `${req.user.username} submitted address checks to prison case admin`,
          })
        }

        res.redirect(`/hdc/sent/${transition.receiver}/${transition.type}/${bookingId}`)
      })
    )

    return router
  }

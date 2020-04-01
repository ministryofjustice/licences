/**
 * @typedef {import("../services/prisonerService").PrisonerService} PrisonerService
 */
const { asyncMiddleware } = require('../utils/middleware')
const transitionsForDestinations = require('../services/notifications/transitionsForDestinations')
const { getIn } = require('../utils/functionalHelpers')
/**
 * @param {object} args
 * @param {PrisonerService} args.prisonerService
 * @param {any} args.notificationService
 */
module.exports = ({ prisonerService, notificationService }) => router => {
  router.get('/:destination/:bookingId', async (req, res) => {
    const { destination, bookingId } = req.params
    const transition = transitionsForDestinations[destination]
    const submissionTarget = await prisonerService.getOrganisationContactDetails(
      transition.receiver,
      bookingId,
      res.locals.token
    )

    let reReferToDm = false
    const dmAlreadyDecided = getIn(res.locals.licence, ['licence', 'approval', 'release', 'decision'])

    if (transition.type === 'caToDm' && dmAlreadyDecided) {
      reReferToDm = true
    }

    res.render(`send/${transition.type}`, { bookingId, submissionTarget, reReferToDm })
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

      res.redirect(`/hdc/sent/${transition.receiver}/${transition.type}/${bookingId}`)
    })
  )

  return router
}

const { asyncMiddleware } = require('../utils/middleware')
const transitionsForDestinations = require('../services/notifications/transitionsForDestinations')

module.exports = ({ prisonerService, notificationService }) => router => {
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

      res.redirect(`/hdc/sent/${transition.receiver}/${transition.type}/${bookingId}`)
    })
  )

  return router
}

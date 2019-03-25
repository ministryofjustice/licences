const { asyncMiddleware } = require('../utils/middleware')

module.exports = ({ licenceService, prisonerService, notificationService, audit }) => router => {
  router.get('/:destination/:bookingId', async (req, res) => {
    const { destination, bookingId } = req.params
    const transition = transitionForDestination[destination]
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
      const transition = transitionForDestination[destination]

      const submissionTarget = await prisonerService.getOrganisationContactDetails(
        transition.receiver,
        bookingId,
        res.locals.token
      )

      const notifications = await notificationService.getNotificationData({
        prisoner: res.locals.prisoner,
        token: res.locals.token,
        notificationType: transition.notificationType,
        submissionTarget,
        bookingId,
        sendingUser: req.user,
      })

      await Promise.all([
        licenceService.markForHandover(bookingId, transition.type),
        notificationService.notify({
          user: req.user.username,
          type: transition.notificationType,
          bookingId,
          notifications,
        }),
      ])

      if (transition.type === 'dmToCaReturn') {
        await licenceService.removeDecision(bookingId, res.locals.licence)
      }

      auditEvent(req.user.username, bookingId, transition.type, submissionTarget)

      res.redirect(`/hdc/sent/${transition.receiver}/${transition.type}/${bookingId}`)
    })
  )

  const transitionForDestination = {
    addressReview: { type: 'caToRo', receiver: 'RO', notificationType: 'RO_NEW' },
    bassReview: { type: 'caToRo', receiver: 'RO', notificationType: 'RO_NEW' },
    finalChecks: { type: 'roToCa', receiver: 'CA', notificationType: 'CA_RETURN' },
    approval: { type: 'caToDm', receiver: 'DM', notificationType: 'DM_NEW' },
    decided: { type: 'dmToCa', receiver: 'CA', notificationType: 'CA_DECISION' },
    return: { type: 'dmToCaReturn', receiver: 'CA', notificationType: 'CA_RETURN' },
    refusal: { type: 'caToDmRefusal', receiver: 'DM', notificationType: 'DM_NEW' },
    addressRejected: { type: 'roToCaAddressRejected', receiver: 'CA', notificationType: 'CA_RETURN' },
    bassAreaRejected: { type: 'roToCaAddressRejected', receiver: 'CA', notificationType: 'CA_RETURN' },
    optedOut: { type: 'roToCaOptedOut', receiver: 'CA', notificationType: 'CA_RETURN' },
  }

  function auditEvent(user, bookingId, transitionType, submissionTarget) {
    audit.record('SEND', user, {
      bookingId,
      transitionType,
      submissionTarget,
    })
  }

  return router
}

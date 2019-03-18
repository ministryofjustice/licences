const { asyncMiddleware } = require('../utils/middleware')
const { getIn } = require('../utils/functionalHelpers')
const notificationMailboxes = require('./config/notificationMailboxes')
const { getRoNewCaseDueDate } = require('../utils/dueDates')

module.exports = ({ licenceService, prisonerService, notificationService, userAdminService, audit }) => router => {
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

      const [submissionTarget, prisonerDetails] = await Promise.all([
        prisonerService.getOrganisationContactDetails(transition.receiver, bookingId, res.locals.token),
        prisonerService.getPrisonerDetails(bookingId, res.locals.token),
      ])

      const notificationData = await getNotificationData({
        prisonerDetails,
        token: res.locals.token,
        transition,
        submissionTarget,
        bookingId,
        sendingUser: req.user,
      })

      await Promise.all([
        licenceService.markForHandover(bookingId, transition.type),
        notificationService.notify(req.user.username, transition.notification, notificationData),
      ])

      if (transition.type === 'dmToCaReturn') {
        await licenceService.removeDecision(bookingId, res.locals.licence)
      }

      auditEvent(req.user.username, bookingId, transition.type, submissionTarget)

      res.redirect(`/hdc/sent/${transition.receiver}/${transition.type}/${bookingId}`)
    })
  )

  const transitionForDestination = {
    addressReview: { type: 'caToRo', receiver: 'RO', notification: 'RO_NEW' },
    bassReview: { type: 'caToRo', receiver: 'RO', notification: 'RO_NEW' },
    finalChecks: { type: 'roToCa', receiver: 'CA', notification: 'CA_RETURN' },
    approval: { type: 'caToDm', receiver: 'DM', notification: 'DM_NEW' },
    decided: { type: 'dmToCa', receiver: 'CA', notification: 'CA_DECISION' },
    return: { type: 'dmToCaReturn', receiver: 'CA', notification: 'CA_RETURN' },
    refusal: { type: 'caToDmRefusal', receiver: 'DM', notification: 'DM_NEW' },
    addressRejected: { type: 'roToCaAddressRejected', receiver: 'CA', notification: 'CA_RETURN' },
    bassAreaRejected: { type: 'roToCaAddressRejected', receiver: 'CA', notification: 'CA_RETURN' },
    optedOut: { type: 'roToCaOptedOut', receiver: 'CA', notification: 'CA_RETURN' },
  }

  function auditEvent(user, bookingId, transitionType, submissionTarget) {
    audit.record('SEND', user, {
      bookingId,
      transitionType,
      submissionTarget,
    })
  }

  async function getNotificationData({ prisonerDetails, token, transition, submissionTarget, bookingId, sendingUser }) {
    const personalisation = {
      offender_name: [prisonerDetails.firstName, prisonerDetails.lastName].join(' '),
      offender_dob: prisonerDetails.dateOfBirth,
      booking_id: bookingId,
    }

    const notificationDataMethod = {
      CA_RETURN: getCaNotificationData,
      CA_DECISION: getCaNotificationData,
      RO_NEW: getRoNotificationData,
      DM_NEW: getDmNotificationData,
    }

    const data = notificationDataMethod[transition.notification]
      ? await notificationDataMethod[transition.notification]({ token, submissionTarget, bookingId, sendingUser })
      : {}

    return { ...personalisation, ...data }
  }

  function getCaNotificationData({ submissionTarget, sendingUser }) {
    const emails = getIn(notificationMailboxes, [submissionTarget.agencyId, 'ca'])
    return { sender_name: sendingUser.username, emails }
  }

  async function getRoNotificationData({ token, submissionTarget, bookingId }) {
    const [establishment, ro] = await Promise.all([
      prisonerService.getEstablishmentForPrisoner(bookingId, token),
      userAdminService.getRoUserByDeliusId(submissionTarget.com.deliusId),
    ])
    const emails = [ro.orgEmail]
    const date = getRoNewCaseDueDate()

    return { ro_name: submissionTarget.com.name, prison: establishment.premise, emails, date }
  }

  async function getDmNotificationData({ token, bookingId }) {
    const establishment = await prisonerService.getEstablishmentForPrisoner(bookingId, token)
    const emails = getIn(notificationMailboxes, [establishment.agencyId, 'dm'])

    return { emails, dm_name: 'todo' }
  }

  return router
}

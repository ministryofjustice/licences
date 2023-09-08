/**
 * @typedef {import("../../services/prisonerService").PrisonerService} PrisonerService
 */
const R = require('ramda')
const logger = require('../../../log')
const { getIn, isEmpty } = require('../../utils/functionalHelpers')

/**
 *  @param {PrisonerService} prisonerService
 */
module.exports = function createCaAndDmNotificationSender(
  prisonerService,
  roContactDetailsService,
  configClient,
  notificationSender,
  nomisClientBuilder,
  { notifications: { activeNotificationTypes, ..._ }, domain, ...rest }
) {
  async function getNotificationData({
    prisoner,
    token,
    notificationType,
    submissionTarget,
    bookingId,
    transitionDate,
    sendingUserName,
  }) {
    const common = {
      offender_name: [prisoner.firstName, prisoner.lastName].join(' '),
      offender_dob: prisoner.dateOfBirth,
      offender_noms: prisoner.offenderNo,
      booking_id: bookingId,
      domain,
    }

    return notificationDataMethod[notificationType]
      ? notificationDataMethod[notificationType]({
          common,
          token,
          submissionTarget,
          bookingId,
          transitionDate,
          sendingUserName,
        })
      : []
  }

  // object -> string -> string
  const replaceName = (replacements) => (name) => R.propOr(name, name, replacements)

  // object -> [notification] -> [notification]
  const replaceTemplateNames = (replacements) => R.map(R.over(R.lensProp('templateName'), replaceName(replacements)))

  const roOrganisationNotification = async (args, notifications) => {
    const orgEmail = await roContactDetailsService.getFunctionalMailBox(args.bookingId, args.token)
    return isEmpty(orgEmail) || isEmpty(notifications)
      ? []
      : [{ ...notifications[0], email: orgEmail, templateName: 'COPY' }]
  }

  const getCaAndRoOrganisationNotifications = async (args) => {
    const notifications = await getCaNotifications(args)
    return [...notifications, ...(await roOrganisationNotification(args, notifications))]
  }

  async function getCaNotifications({ common, token, submissionTarget, sendingUserName }) {
    const agencyId = getIn(submissionTarget, ['agencyId'])

    if (isEmpty(agencyId)) {
      logger.error('Missing agencyId for CA notification')
      return []
    }

    const establishment = await nomisClientBuilder(token).getEstablishment(agencyId)
    const prison = establishment.premise

    const mailboxes = await configClient.getMailboxes(submissionTarget.agencyId, 'CA')

    if (isEmpty(mailboxes)) {
      logger.error(`Missing CA notification email addresses for agencyId: ${agencyId}`)
      return []
    }
    const personalisation = { ...common, sender_name: sendingUserName, prison }

    return mailboxes.map((mailbox) => {
      return {
        personalisation: { ...personalisation, ca_name: mailbox.name },
        email: mailbox.email,
        templateName: 'STANDARD',
      }
    })
  }

  async function getDmNotifications({ common, token, bookingId }) {
    const establishment = await prisonerService.getEstablishmentForPrisoner(bookingId, token)

    const mailboxes = await configClient.getMailboxes(establishment.agencyId, 'DM')

    if (isEmpty(mailboxes)) {
      logger.error(`Missing DM notification email addresses for agencyId: ${establishment.agencyId}`)
      return []
    }

    return mailboxes.map((mailbox) => {
      return { personalisation: { ...common, dm_name: mailbox.name }, email: mailbox.email, templateName: 'STANDARD' }
    })
  }

  const notificationDataMethod = {
    CA_RETURN: R.compose(
      R.andThen(replaceTemplateNames({ STANDARD: 'CA_RETURN', COPY: 'CA_RETURN_COPY' })),
      getCaAndRoOrganisationNotifications
    ),
    DM_TO_CA_RETURN: R.compose(R.andThen(replaceTemplateNames({ STANDARD: 'CA_RETURN' })), getCaNotifications),
    CA_DECISION: R.compose(R.andThen(replaceTemplateNames({ STANDARD: 'CA_DECISION' })), getCaNotifications),
    DM_NEW: R.compose(R.andThen(replaceTemplateNames({ STANDARD: 'DM_NEW' })), getDmNotifications),
  }

  async function sendNotifications({
    prisoner,
    token,
    notificationType,
    submissionTarget,
    bookingId,
    transitionDate,
    sendingUserName,
  }) {
    if (!activeNotificationTypes.includes(notificationType)) {
      return []
    }

    try {
      const notifications = await getNotificationData({
        prisoner,
        token,
        notificationType,
        submissionTarget,
        bookingId,
        transitionDate,
        sendingUserName,
      })

      if (isEmpty(notifications)) {
        return []
      }

      await notificationSender.notify({
        sendingUserName,
        notificationType,
        bookingId,
        notifications,
      })

      return notifications
    } catch (error) {
      logger.error(
        `Error sending notification for bookingId: ${bookingId}, transition: ${notificationType}`,
        error.stack
      )
      return []
    }
  }

  return {
    getNotificationData,
    sendNotifications,
  }
}

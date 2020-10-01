const { asyncMiddleware } = require('../utils/middleware')
const { unwrapResult } = require('../utils/functionalHelpers')
/**
 * @typedef {import("../services/roService").RoService} RoService
 * @typedef {import("../../types/licences").ResponsibleOfficerResult} ResponsibleOfficerResult
 * @typedef {import("../../types/licences").ResponsibleOfficer} ResponsibleOfficer
 */
/**
 *
 * @param userAdminService
 * @param {RoService} roService
 * @returns {function(*): *}
 */
module.exports = (userAdminService, roService, signInService) => (router) => {
  const getFunctionalMailBox = async (ro) =>
    ro &&
    ro.probationAreaCode &&
    ro.lduCode &&
    ro.teamCode &&
    userAdminService.getFunctionalMailbox(ro.probationAreaCode, ro.lduCode, ro.teamCode)

  router.get(
    '/:theBookingId',
    asyncMiddleware(async (req, res) => {
      // because 'bookingId' is treated specially - see standardRouter.js
      const { theBookingId } = req.params
      const token = await signInService.getClientCredentialsTokens(req.user.username)
      const [ro] = unwrapResult(await roService.findResponsibleOfficer(theBookingId, token.token))

      const contact =
        ro && ro.staffIdentifier && (await userAdminService.getRoUserByStaffIdentifier(ro.staffIdentifier))
      if (contact) {
        return res.render('contact/ro', { contact })
      }

      const staffDetailsResult =
        ro && ro.staffIdentifier && (await roService.getStaffByStaffIdentifier(ro.staffIdentifier))
      const [staffDetails] = unwrapResult(staffDetailsResult)

      if (staffDetails && staffDetails.username) {
        const contactByUsername = await userAdminService.getRoUserByDeliusUsername(staffDetails.username)
        if (contactByUsername) {
          return res.render('contact/ro', { contact: contactByUsername })
        }
      }

      return res.render('contact/deliusRo', {
        ro,
        functionalMailbox: await getFunctionalMailBox(ro),
        email: staffDetails && staffDetails.email,
      })
    })
  )

  return router
}

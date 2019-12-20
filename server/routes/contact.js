const { asyncMiddleware } = require('../utils/middleware')
const { unwrapResult } = require('../utils/functionalHelpers')
/**
 * @typedef {import("../../types/licences").RoService} RoService
 * @typedef {import("../../types/licences").ResponsibleOfficerResult} ResponsibleOfficerResult
 * @typedef {import("../../types/licences").ResponsibleOfficer} ResponsibleOfficer
 */
/**
 *
 * @param userAdminService
 * @param {RoService} roService
 * @returns {function(*): *}
 */
module.exports = (userAdminService, roService) => router => {
  router.get(
    '/:theBookingId',
    asyncMiddleware(async (req, res) => {
      // because 'bookingId' is treated specially - see standardRouter.js
      const { theBookingId } = req.params
      const [ro] = unwrapResult(await roService.findResponsibleOfficer(theBookingId, res.locals.token))

      const contact = ro && ro.deliusId && (await userAdminService.getRoUserByDeliusId(ro.deliusId))
      if (contact) {
        return res.render('contact/ro', { contact })
      }

      const functionalMailbox = ro && ro.lduCode && (await userAdminService.getFunctionalMailbox(ro.lduCode))
      const staffDetailsResult = ro && ro.deliusId && (await roService.getStaffByCode(ro.deliusId))
      const [staffDetails] = unwrapResult(staffDetailsResult)
      const email = staffDetails && staffDetails.email

      return res.render('contact/deliusRo', {
        ro,
        functionalMailbox,
        email,
      })
    })
  )

  return router
}

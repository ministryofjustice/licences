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
    '/:borkingId',
    asyncMiddleware(async (req, res) => {
      // because 'bookingId' is treated specially - see standardRouter.js
      const { borkingId } = req.params
      const [ro] = unwrapResult(await roService.findResponsibleOfficer(borkingId, res.locals.token))

      const contact = ro.deliusId ? await userAdminService.getRoUserByDeliusId(ro.deliusId) : undefined
      if (contact) {
        return res.render('contact/ro', { contact })
      }

      return res.render('contact/deliusRo', {
        ro,
        functionalMailbox: await userAdminService.getFunctionalMailbox(ro.lduCode),
      })
    })
  )

  return router
}

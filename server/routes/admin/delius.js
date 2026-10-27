/**
 * @typedef {import("../../services/roService").RoService} RoService
 */
const logger = require('../../../log')
const { asyncMiddleware, authorisationMiddleware } = require('../../utils/middleware')

/**
 * @param {RoService} roService
 */
module.exports = (roService) => (router) => {
  router.use(authorisationMiddleware)

  router.get(
    '/',
    asyncMiddleware(async (req, res) => {
      return res.render('admin/delius')
    })
  )

  router.post(
    '/managedOffenders/',
    asyncMiddleware(async (req, res) => {
      const { staffIdentifier } = req.body
      logger.info({ staffIdentifier }, 'managedOffenders for')
      const offenders = (await roService.getROPrisonersForStaffIdentifier(staffIdentifier, res.locals.token)) || []
      logger.info(offenders)

      res.render('admin/delius/managedOffenders', { offenders })
    })
  )

  router.post(
    '/responsibleOfficer',
    asyncMiddleware(async (req, res) => {
      const { bookingId, offenderNo } = req.body

      const ro = bookingId ? await roByBookingId(bookingId, res.locals.token) : await roByOffenderNo(offenderNo)

      logger.info({ ro }, 'Found ro:')
      res.render('admin/delius/responsibleOfficer', { ro })
    })
  )

  router.post(
    '/staffDetails',
    asyncMiddleware(async (req, res) => {
      const { value, type } = req.body

      const staffDetails =
        type === 'STAFF_IDENTIFIER' ? await getStaffByStaffIdentifier(value) : await staffByUsername(value)

      logger.info({ staffDetails }, 'Found staff:')

      res.render('admin/delius/staffDetails', { type, value, staffDetails })
    })
  )

  async function roByBookingId(bookingId, token) {
    logger.info({ bookingId }, 'responsibleOfficer for bookingId')
    return roService.findResponsibleOfficer(bookingId, token)
  }

  async function roByOffenderNo(offenderNo) {
    logger.info({ offenderNo }, 'responsibleOfficer for offenderNo')
    return roService.findResponsibleOfficerByOffenderNo(offenderNo)
  }

  async function getStaffByStaffIdentifier(identifier) {
    logger.info({ identifier }, 'staff for identifier')
    return roService.getStaffByStaffIdentifier(identifier)
  }

  async function staffByUsername(username) {
    logger.info({ username }, 'staff for offenderNo')
    return roService.getStaffByUsername(username)
  }

  return router
}

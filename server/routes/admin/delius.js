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
      logger.info('managedOffenders for', staffIdentifier)
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

      logger.info('Found ro:', ro)
      res.render('admin/delius/responsibleOfficer', { ro })
    })
  )

  router.post(
    '/staffDetails',
    asyncMiddleware(async (req, res) => {
      const { value, type } = req.body

      const staffDetails = type === 'STAFF_CODE' ? await getStaffByStaffIdentifier(value) : await staffByUsername(value)

      logger.info('Found staff:', staffDetails)

      res.render('admin/delius/staffDetails', { type, value, staffDetails })
    })
  )

  async function roByBookingId(bookingId, token) {
    logger.info('responsibleOfficer for bookingId', bookingId)
    return roService.findResponsibleOfficer(bookingId, token)
  }

  async function roByOffenderNo(offenderNo) {
    logger.info('responsibleOfficer for offenderNo', offenderNo)
    return roService.findResponsibleOfficerByOffenderNo(offenderNo)
  }

  async function getStaffByStaffIdentifier(identifier) {
    logger.info('staff for identifier', identifier)
    return roService.getStaffByStaffIdentifier(identifier)
  }

  async function staffByUsername(username) {
    logger.info('staff for offenderNo', username)
    return roService.getStaffByUsername(username)
  }

  return router
}

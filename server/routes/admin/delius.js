const logger = require('../../../log')
const { asyncMiddleware, authorisationMiddleware } = require('../../utils/middleware')

module.exports = ({ deliusRoService }) => router => {
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
      const { staffCode } = req.body
      logger.info('managedOffenders for', staffCode)
      const offenders = await deliusRoService.getROPrisoners(staffCode, res.locals.token)
      logger.info(offenders)

      res.render('admin/delius/managedOffenders', { offenders })
    })
  )

  router.post(
    '/responsibleOfficer',
    asyncMiddleware(async (req, res) => {
      const { bookingId, offenderNo } = req.body

      const ro = bookingId
        ? await roByBookingId(bookingId, res.locals.token)
        : await roByOffenderNo(offenderNo, res.locals.token)

      logger.info(ro)
      res.render('admin/delius/responsibleOfficer', { ro })
    })
  )

  router.post(
    '/staffDetails',
    asyncMiddleware(async (req, res) => {
      const { value, type } = req.body

      const staffDetails = type === 'STAFF_CODE' ? await staffByCode(value) : await staffByUsername(value)

      logger.info(staffDetails)

      res.render('admin/delius/staffDetails', { type, value, staffDetails })
    })
  )

  async function roByBookingId(bookingId, token) {
    logger.info('responsibleOfficer for bookingId', bookingId)
    return deliusRoService.findResponsibleOfficer(bookingId, token)
  }

  async function roByOffenderNo(offenderNo, token) {
    logger.info('responsibleOfficer for offenderNo', offenderNo)
    return deliusRoService.findResponsibleOfficerByOffenderNo(offenderNo, token)
  }

  async function staffByCode(code) {
    logger.info('staff for code', code)
    return deliusRoService.getStaffByCode(code)
  }

  async function staffByUsername(username) {
    logger.info('staff for offenderNo', username)
    return deliusRoService.getStaffByUsername(username)
  }

  return router
}

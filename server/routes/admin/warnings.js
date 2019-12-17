/**
 * @typedef {import("../../../types/licences").WarningClient} WarningClient
 */
const moment = require('moment')
const { asyncMiddleware, authorisationMiddleware } = require('../../utils/middleware')
const logger = require('../../../log')

/**
 *  @param {WarningClient} warningsClient
 */
module.exports = warningsClient => (router, audited) => {
  router.use(authorisationMiddleware)

  router.get(
    '/outstanding',
    asyncMiddleware(async (req, res) => {
      const results = await warningsClient.getOutstandingWarnings()
      const warnings = results.map(warning => ({
        ...warning,
        timestamp: moment(warning.timestamp).format('dddd Do MMMM HH:mm:ss'),
      }))
      return res.render('admin/warnings/listOutstanding', { warnings, heading: 'Outstanding Warnings' })
    })
  )

  router.post(
    '/acknowledge',
    audited,
    asyncMiddleware(async (req, res) => {
      const { bookingId } = req.body
      logger.info(`Acknowledging warnings for these bookings: [${bookingId}]`)
      const count = await warningsClient.acknowledgeWarnings(bookingId)
      logger.info(`Acknowledged ${count} warnings`)
      return res.redirect('/admin/warnings/outstanding')
    })
  )

  router.get(
    '/acknowledged',
    asyncMiddleware(async (req, res) => {
      const results = await warningsClient.getAcknowledgedWarnings()
      const warnings = results.map(warning => ({
        ...warning,
        timestamp: moment(warning.timestamp).format('dddd Do MMMM HH:mm:ss'),
      }))
      return res.render('admin/warnings/listAcknowledged', { warnings, heading: 'Acknowledged Warnings' })
    })
  )

  return router
}

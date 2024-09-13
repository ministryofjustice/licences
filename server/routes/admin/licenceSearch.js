/**
 * @typedef {import("../../../types/licences").LicenceSearchService} LicenceSearchService
 */
const moment = require('moment')
const { asyncMiddleware, authorisationMiddleware } = require('../../utils/middleware')
const logger = require('../../../log')
const { firstItem } = require('../../utils/functionalHelpers')

/**
 *  @param {LicenceSearchService} licenceSearchService
 */
module.exports = (licenceSearchService) => (router, audited) => {
  router.use(authorisationMiddleware)

  router.get(
    '/',
    asyncMiddleware(async (req, res) => {
      const errors = firstItem(req.flash('errors')) || {}
      return res.render('admin/licences/search', { errors })
    })
  )

  router.get(
    '/:identifier',
    asyncMiddleware(async (req, res) => {
      const { identifier } = req.params
      const references = await licenceSearchService.findForIdentifier(identifier)
      const licences = references.map((l) => ({
        id: l.id,
        bookingId: l.booking_id,
        stage: l.stage,
        transitionDate: l.transition_date && moment(l.transition_date).format('DD/MM/YYYY HH:mm'),
        deletedAt: l.deleted_at && moment(l.deleted_at).format('DD/MM/YYYY HH:mm'),
      }))
      return res.render('admin/licences/many', { licences })
    })
  )

  router.post(
    '/',
    audited,
    asyncMiddleware(async (req, res) => {
      const { id } = req.body
      logger.info(`Searching for licence with identifier: [${id}]`)
      const licences = await licenceSearchService.findForIdentifier(id)

      if (licences.length === 1) {
        return res.redirect(`/admin/licences/${licences[0].id}`)
      }
      if (licences.length > 0) {
        return res.redirect(`/admin/licenceSearch/${id}`)
      }

      req.flash('errors', { id: `Could not find licence with identifier: '${id || ''}'` })
      return res.redirect('/admin/licenceSearch')
    })
  )

  return router
}

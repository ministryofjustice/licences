/**
 * @typedef {import("../../../types/licences").LicenceSearchService} LicenceSearchService
 */
const { asyncMiddleware, authorisationMiddleware } = require('../../utils/middleware')
const logger = require('../../../log')
const { firstItem } = require('../../utils/functionalHelpers')

/**
 *  @param {LicenceSearchService} licenceSearchService
 */
module.exports = licenceSearchService => (router, audited) => {
  router.use(authorisationMiddleware)

  router.get(
    '/',
    asyncMiddleware(async (req, res) => {
      const errors = firstItem(req.flash('errors')) || {}
      return res.render('admin/licenceSearch', { errors })
    })
  )

  router.post(
    '/',
    audited,
    asyncMiddleware(async (req, res) => {
      const { id } = req.body
      logger.info(`Searching for licence with identifier: [${id}]`)
      const licenceId = await licenceSearchService.findForId(req.user.username, id)
      if (licenceId) {
        return res.redirect(`/admin/licences/${licenceId}`)
      }
      req.flash('errors', { id: `Could not find licences with identifier: '${id || ''}'` })
      return res.redirect('/admin/licenceSearch')
    })
  )

  return router
}

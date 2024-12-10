import { firstItem } from '../../utils/functionalHelpers'

const { asyncMiddleware, authorisationMiddleware } = require('../../utils/middleware')
const logger = require('../../../log')

export = (licenceSearchService) => (router, audited) => {
  router.use(authorisationMiddleware)

  router.get(
    '/',
    asyncMiddleware(async (req, res) => {
      const errors = firstItem(req.flash('errors')) || {}
      return res.render('admin/licences/completionDestinationSearch', { errors })
    })
  )

  router.post(
    '/',
    audited,
    asyncMiddleware(async (req, res) => {
      const { id } = req.body
      logger.info(`Searching for licence with identifier: [${id}]`)
      const bookingId = await licenceSearchService.findForId(req.user.username, id)
      if (bookingId) {
        return res.redirect(`/admin/completionDestination/${bookingId}/set-complete-destination`)
      }
      req.flash('errors', { id: `Could not find licence with identifier: '${id || ''}'` })
      return res.redirect('/admin/completionDestinationSearch')
    })
  )

  return router
}

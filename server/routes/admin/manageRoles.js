const logger = require('../../../log')
const { asyncMiddleware, authorisationMiddleware } = require('../../utils/middleware')
const { firstItem } = require('../../utils/functionalHelpers')
const {
  delius: { responsibleOfficerRoleId, responsibleOfficerVaryRoleId },
} = require('../../config')

const codes = {
  [responsibleOfficerRoleId]: 'RO',
  [responsibleOfficerVaryRoleId]: 'VARY',
}

module.exports = (migrationService) => (router) => {
  router.use(authorisationMiddleware)

  router.get(
    '/',
    asyncMiddleware(async (req, res) => {
      const errors = firstItem(req.flash('errors')) || {}
      return res.render('admin/manageRoles/index', { errors })
    })
  )

  router.post(
    '/',
    asyncMiddleware(async (req, res) => {
      const { deliusUsername } = req.body
      return res.redirect(`/admin/manage-roles/${deliusUsername}`)
    })
  )

  router.get(
    '/:deliusUsername',
    asyncMiddleware(async (req, res) => {
      const { deliusUsername } = req.params
      const roles = await migrationService.getDeliusRoles(deliusUsername)
      if (!roles) {
        req.flash('errors', { deliusUsername: `User '${deliusUsername}' does not exist` })
        return res.redirect(`/admin/manage-roles`)
      }
      const currentRoles = roles.map((r) => codes[r])
      const rolesToSelect = Object.keys(codes)
        .filter((key) => !currentRoles.includes(codes[key]))
        .reduce((obj, key) => ({ ...obj, [key]: codes[key] }), {})

      return res.render('admin/manageRoles/viewUserRoles', { deliusUsername, errors: {}, currentRoles, rolesToSelect })
    })
  )

  router.post(
    '/:deliusUsername/roles',
    asyncMiddleware(async (req, res) => {
      const { deliusUsername } = req.params
      const { role } = req.body

      if (role) {
        logger.info(`'${req.user.username}' is adding role '${role}' to delius user '${deliusUsername}'`)
        await migrationService.addDeliusRole(deliusUsername, role)
      }

      return res.redirect(`/admin/manage-roles/${deliusUsername}`)
    })
  )

  return router
}

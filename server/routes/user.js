const { asyncMiddleware } = require('../utils/middleware')
const { roles } = require('../config')

module.exports = ({ userService }) => router => {
  router.get(
    '/',
    asyncMiddleware(async (req, res) => {
      const [allRoles, allCaseLoads] = await Promise.all([
        userService.getAllRoles(res.locals.token),
        userService.getAllCaseLoads(req.user, res.locals.token),
      ])

      const isAdmin = roles.admin.includes(req.user.role)
      res.render(`user/admin`, { allRoles, allCaseLoads, user: req.user, isAdmin })
    })
  )

  router.post(
    '/',
    asyncMiddleware(async (req, res) => {
      if (req.body.role !== req.user.role) {
        await userService.setRole(req.body.role, req.user)
      }

      if (req.body.caseLoadId !== req.user.activeCaseLoadId) {
        await userService.setActiveCaseLoad(req.body.caseLoad, req.user, res.locals.token)
      }

      res.redirect('/user')
    })
  )

  return router
}

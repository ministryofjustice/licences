const { isAdminRole } = require('../authentication/roles')

module.exports = () => (router) => {
  router.get('/', (req, res) => {
    if (req.user && isAdminRole(req.user.role)) {
      return res.redirect('/admin/')
    }
    return res.redirect('/caseList/active')
  })

  return router
}

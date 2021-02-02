const { authorisationMiddleware } = require('../../utils/middleware')
const { links } = require('../../config')
const { hasNomisAuthSource } = require('../../authentication/roles')

module.exports = () => (router) => {
  router.use(authorisationMiddleware)

  router.get('/', (req, res) => {
    return res.render('admin/index', {
      exitUrl: links.exitUrl,
      showExitUrl: hasNomisAuthSource(req.user),
    })
  })

  return router
}

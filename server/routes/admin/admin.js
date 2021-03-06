const { authorisationMiddleware } = require('../../utils/middleware')
const { links } = require('../../config')

module.exports = () => (router) => {
  router.use(authorisationMiddleware)

  router.get('/', (req, res) => {
    return res.render('admin/index', {
      exitUrl: links.exitUrl,
      showExitUrl: req.user && req.user.isPrisonUser,
    })
  })

  return router
}

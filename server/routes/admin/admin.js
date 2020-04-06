const { authorisationMiddleware } = require('../../utils/middleware')

module.exports = () => (router) => {
  router.use(authorisationMiddleware)

  router.get('/', (req, res) => {
    return res.render('admin/index')
  })

  return router
}

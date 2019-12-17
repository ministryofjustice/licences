const { asyncMiddleware } = require('../utils/middleware')

module.exports = ({ userAdminService }) => router => {
  router.get(
    '/ro/:deliusUserId',
    asyncMiddleware(async (req, res) => {
      const { deliusUserId } = req.params
      const contact = await userAdminService.getRoUserByDeliusId(deliusUserId)

      return res.render('contact/ro', { contact })
    })
  )

  return router
}

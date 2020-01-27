const { asyncMiddleware, authorisationMiddleware } = require('../../utils/middleware')

module.exports = (licenceService, signInService, prisonerService) => router => {
  router.use(authorisationMiddleware)

  router.get(
    '/:bookingId',
    asyncMiddleware(async (req, res) => {
      const { bookingId } = req.params
      const licence = await licenceService.getLicence(bookingId)
      const systemToken = await signInService.getClientCredentialsTokens(req.user.username)
      const prisonerInfo = await prisonerService.getPrisonerDetails(bookingId, systemToken.token)
      return res.render('admin/licences/view', { bookingId, licence, prisonerInfo })
    })
  )

  return router
}

const { asyncMiddleware, authorisationMiddleware } = require('../../utils/middleware')

export = (licenceService, signInService, prisonerService) => (router) => {
  router.use(authorisationMiddleware)

  router.get(
    '/:abookingId/set-complete-destination',
    asyncMiddleware(async (req, res) => {
      const bookingId = req.params.abookingId
      const systemToken = await signInService.getClientCredentialsTokens(req.user.username)
      const prisonerInfo = await prisonerService.getPrisonerDetails(bookingId, systemToken)
      const { licenceInCvl } = await licenceService.getLicence(bookingId)

      res.render('admin/licences/completionDestination', { licenceInCvl, prisonerInfo })
    })
  )

  router.post(
    '/:abookingId/set-complete-destination',
    asyncMiddleware(async (req, res) => {
      const bookingId = req.params.abookingId
      const { licenceInCvl } = req.body

      const licenceInCvlBoolean = licenceInCvl == 'true' ? true : false
      await licenceService.setLicenceCompletionDestination(licenceInCvlBoolean, bookingId)
      return res.redirect(`/admin`)
    })
  )

  return router
}

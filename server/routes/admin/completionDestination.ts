const { asyncMiddleware, authorisationMiddleware } = require('../../utils/middleware')

export = (licenceService, signInService, prisonerService, audit) => (router) => {
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
      const { username } = req.user

      const licenceInCvlBoolean = licenceInCvl == 'true' ? true : false
      const setLicenceCompletionDestination = licenceInCvlBoolean ? 'CREATE_IN_CVL' : 'CREATE_IN_HDC'
      await licenceService.setLicenceCompletionDestination(licenceInCvlBoolean, bookingId)
      await audit.record(setLicenceCompletionDestination, username, { bookingId })
      return res.redirect(`/admin`)
    })
  )

  return router
}

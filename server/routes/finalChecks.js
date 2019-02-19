const { asyncMiddleware } = require('../utils/middleware')
const createStandardRoutes = require('./routeWorkers/standard')
const { getIn, isEmpty, pickBy, getFieldName } = require('../utils/functionalHelpers')
const { getPathFor } = require('../utils/routes')
const formConfig = require('./config/finalChecks')

module.exports = ({ licenceService, signInService, nomisPushService }) => (router, audited, { pushToNomis }) => {
  const standard = createStandardRoutes({ formConfig, licenceService, sectionName: 'finalChecks' })

  router.post(
    '/postpone/:bookingId',
    audited,
    asyncMiddleware(async (req, res) => {
      const { bookingId } = req.params

      const expectedFields = formConfig.postpone.fields.map(getFieldName)
      const inputForExpectedFields = pickBy((val, key) => expectedFields.includes(key), req.body)
      const errors = licenceService.validateForm({
        formResponse: inputForExpectedFields,
        pageConfig: formConfig.postpone,
        formType: 'postpone',
      })

      if (!isEmpty(errors)) {
        req.flash('errors', errors)
        req.flash('userInput', inputForExpectedFields)
        return res.redirect(`/hdc/finalChecks/postpone/${bookingId}`)
      }

      const updatedLicence = await licenceService.update({
        bookingId,
        originalLicence: res.locals.licence,
        config: formConfig.postpone,
        userInput: req.body,
        licenceSection: 'finalChecks',
        formName: 'postpone',
        postRelease: res.locals.postRelease,
      })

      if (pushToNomis) {
        const systemToken = await signInService.getClientCredentialsTokens(req.user.username)
        await nomisPushService.pushStatus(
          bookingId,
          {
            postpone: getIn(updatedLicence, ['finalChecks', 'postpone', 'decision']),
            postponeReason: getIn(updatedLicence, ['finalChecks', 'postpone', 'postponeReason']),
          },
          systemToken
        )
      }

      const nextPath = getPathFor({ data: req.body, config: formConfig.postpone })
      res.redirect(`${nextPath}${bookingId}`)
    })
  )

  router.get('/:formName/:bookingId', asyncMiddleware(standard.get))
  router.post('/:formName/:bookingId', audited, asyncMiddleware(standard.post))

  return router
}

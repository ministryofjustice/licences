const formConfig = require('./config/eligibility')
const { asyncMiddleware } = require('../utils/middleware')
const { getIn } = require('../utils/functionalHelpers')
const createStandardRoutes = require('./routeWorkers/standard')

module.exports = ({ licenceService, nomisPushService }) => (router, audited, config) => {
  const standard = createStandardRoutes({
    formConfig,
    licenceService,
    sectionName: 'eligibility',
    nomisPushService,
    config,
  })

  const checksPassedCallback = async ({ req, bookingId, updatedLicence }) => {
    if (getIn(config, ['pushToNomis'])) {
      const notExcluded = getIn(updatedLicence, ['eligibility', 'excluded', 'decision']) === 'No'
      const notUnsuitable = getIn(updatedLicence, ['eligibility', 'suitability', 'decision']) === 'No'
      if (notExcluded && notUnsuitable) {
        await nomisPushService.pushChecksPassed({ bookingId, passed: true, username: req.user.username })
      }
    }
  }

  router.post(
    '/suitability/:bookingId',
    audited,
    asyncMiddleware(standard.callbackPost('suitability', checksPassedCallback))
  )

  router.get('/:formName/:bookingId', asyncMiddleware(standard.get))
  router.post('/:formName/:bookingId', audited, asyncMiddleware(standard.post))

  return router
}

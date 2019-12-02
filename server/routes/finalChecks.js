const formConfig = require('./config/finalChecks')
const { asyncMiddleware } = require('../utils/middleware')
const createStandardRoutes = require('./routeWorkers/standard')

module.exports = ({ licenceService, nomisPushService }) => (router, audited, config) => {
  const standard = createStandardRoutes({
    formConfig,
    licenceService,
    sectionName: 'finalChecks',
    nomisPushService,
    config,
  })

  router.get('/:formName/:bookingId', asyncMiddleware(standard.get))
  router.post('/:formName/:bookingId', audited, asyncMiddleware(standard.post))

  return router
}

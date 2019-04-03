const formConfig = require('./config/approval')
const { asyncMiddleware } = require('../utils/middleware')
const createStandardRoutes = require('./routeWorkers/standard')
const { getIn, firstItem } = require('../utils/functionalHelpers')
const logger = require('../../log')

module.exports = ({ licenceService, prisonerService, nomisPushService, signInService }) => (
  router,
  audited,
  config
) => {
  const standard = createStandardRoutes({
    formConfig,
    licenceService,
    sectionName: 'approval',
    nomisPushService,
    signInService,
    config,
  })

  router.get('/release/:bookingId', asyncMiddleware(approvalGets('release')))
  router.get('/refuseReason/:bookingId', asyncMiddleware(approvalGets('refuseReason')))

  function approvalGets(formName) {
    return async (req, res) => {
      logger.debug(`GET /approval/${formName}/`)

      const { bookingId } = req.params
      const prisonerInfo = await prisonerService.getPrisonerDetails(bookingId, res.locals.token)

      const { nextPath, pageDataMap } = formConfig[formName]
      const dataPath = pageDataMap || ['licence', 'approval', 'release']
      const data = firstItem(req.flash('userInput')) || getIn(res.locals.licence, dataPath) || {}
      const errorObject = firstItem(req.flash('errors')) || {}

      res.render(`approval/${formName}`, {
        prisonerInfo,
        bookingId,
        data,
        nextPath,
        errorObject,
      })
    }
  }

  router.post('/:formName/:bookingId', audited, asyncMiddleware(standard.post))

  return router
}

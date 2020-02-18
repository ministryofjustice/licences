const formConfig = require('./config/eligibility')
const { asyncMiddleware } = require('../utils/middleware')
const { getIn, firstItem } = require('../utils/functionalHelpers')
const createStandardRoutes = require('./routeWorkers/standard')
const { cja2003Sza } = require('../config')

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

  /**
   * Copy of standard.js get.
   * Passes in config.cja2003_SZA So that rendering the
   * 'schedule ZA of the Criminal Justice Act 2003' checkbox is configurable
   * Remove when config.cja2003_SZA is enabled everywhere
   */
  function get(req, res) {
    const { bookingId, action } = req.params
    const { licenceSection, nextPath, pageDataMap } = formConfig.excluded
    const dataPath = pageDataMap || ['licence', 'eligibility', licenceSection]

    const rawData = getIn(res.locals.licence, dataPath) || {}
    const data =
      firstItem(req.flash('userInput')) || licenceService.addSplitDateFields(rawData, formConfig.excluded.fields)
    const errorObject = firstItem(req.flash('errors')) || {}

    const viewData = {
      cja2003Sza,
      bookingId,
      data,
      nextPath,
      errorObject,
      action,
      sectionName: 'eligibility',
      formName: 'excluded',
    }
    return res.render('eligibility/excluded', viewData)
  }

  router.post(
    '/suitability/:bookingId',
    audited,
    asyncMiddleware(standard.callbackPost('suitability', checksPassedCallback))
  )

  router.get('/excluded/:bookingId', asyncMiddleware(get))

  router.get('/:formName/:bookingId', asyncMiddleware(standard.get))
  router.post('/:formName/:bookingId', audited, asyncMiddleware(standard.post))

  return router
}

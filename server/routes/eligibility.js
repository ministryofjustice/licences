const formConfig = require('./config/eligibility')
const { asyncMiddleware } = require('../utils/middleware')
const { getIn, firstItem } = require('../utils/functionalHelpers')
const createStandardRoutes = require('./routeWorkers/standard')
const { cja2003s19za } = require('../config')

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
   * Passes in config.cja2003_SZA So that rendering pre/post CJA 2003 schedule 19ZA options is configurable using a feature flag
   */
  function get(req, res) {
    const sectionName = 'eligibility'
    const { formName, bookingId, action } = req.params
    const { licenceSection, nextPath, pageDataMap } = formConfig[formName]
    const dataPath = pageDataMap || ['licence', sectionName, licenceSection]

    const rawData = getIn(res.locals.licence, dataPath) || {}
    const data =
      firstItem(req.flash('userInput')) || licenceService.addSplitDateFields(rawData, formConfig[formName].fields)
    const errorObject = firstItem(req.flash('errors')) || {}

    const viewData = { cja2003s19za, bookingId, data, nextPath, errorObject, action, sectionName, formName }

    res.render(`${sectionName}/${formName}`, viewData)
  }

  router.post(
    '/suitability/:bookingId',
    audited,
    asyncMiddleware(standard.callbackPost('suitability', checksPassedCallback))
  )

  router.get('/:formName/:bookingId', asyncMiddleware(get))
  router.post('/:formName/:bookingId', audited, asyncMiddleware(standard.post))

  return router
}

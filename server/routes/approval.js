/**
 * @typedef {import("../services/prisonerService").PrisonerService} PrisonerService
 */
const formConfig = require('./config/approval')
const { asyncMiddleware } = require('../utils/middleware')
const createStandardRoutes = require('./routeWorkers/standard')
const { getIn, firstItem } = require('../utils/functionalHelpers')
const logger = require('../../log')

/**
 * @param {object} args
 * @param {any} args.licenceService
 * @param {PrisonerService} args.prisonerService
 * @param {any} args.nomisPushService
 * @param {any} args.hdcService
 */
module.exports =
  ({ licenceService, prisonerService, nomisPushService, hdcService }) =>
  (router, audited, config) => {
    const standard = createStandardRoutes({
      formConfig,
      licenceService,
      sectionName: 'approval',
      nomisPushService,
      config,
    })

    const processRefusal = async ({ req, res, bookingId, updatedLicence }) => {
      const decision = getIn(updatedLicence, ['approval', 'release', 'decision'])
      if (decision !== 'No') {
        return
      }

      const previousAnswers = getIn(res.locals.licence, ['licence', 'approval', 'release']) || {}
      const reason = getIn(updatedLicence, ['approval', 'release', 'reason'])
      const hasChanged = previousAnswers.decision !== decision || previousAnswers.reason !== reason
      if (!hasChanged) {
        return
      }

      const { offenderNo } = res.locals.prisoner
      const licenceId = res.locals.licence.id
      await hdcService.postRefuseEvent(parseInt(bookingId, 10), licenceId, offenderNo, req.user.username, reason)
    }

    router.get('/release/:bookingId', asyncMiddleware(approvalGets('release')))
    router.get('/refuseReason/:bookingId', asyncMiddleware(approvalGets('refuseReason')))
    router.get(
      '/mandatoryCheck/:bookingId',
      asyncMiddleware(async (req, res) => {
        const { bookingId } = req.params
        const prisonerInfo = await prisonerService.getPrisonerDetails(bookingId, res.locals.token)
        res.render('approval/mandatoryCheck', { bookingId, prisonerInfo })
      })
    )
    router.get('/consideration/:bookingId', asyncMiddleware(approvalGets('consideration')))

    function approvalGets(formName) {
      return async (req, res) => {
        logger.debug(`GET /approval/${formName}/`)

        const { bookingId } = req.params
        const prisonerInfo = await prisonerService.getPrisonerDetails(bookingId, res.locals.token)

        const { nextPath, pageDataMap } = formConfig[formName]
        const dataPath = pageDataMap || ['licence', 'approval', formName]
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

    router.post('/release/:bookingId', audited, asyncMiddleware(standard.callbackPost('release', processRefusal)))
    router.post(
      '/refuseReason/:bookingId',
      audited,
      asyncMiddleware(standard.callbackPost('refuseReason', processRefusal))
    )
    router.post('/:formName/:bookingId', audited, asyncMiddleware(standard.post))

    return router
  }

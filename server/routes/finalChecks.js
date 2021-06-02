const formConfig = require('./config/finalChecks')
const { asyncMiddleware } = require('../utils/middleware')
const createStandardRoutes = require('./routeWorkers/standard')
const { isEmpty } = require('../utils/functionalHelpers')

module.exports =
  ({ licenceService, nomisPushService }) =>
  (router, audited, config) => {
    const standard = createStandardRoutes({
      formConfig,
      licenceService,
      sectionName: 'finalChecks',
      nomisPushService,
      config,
    })

    router.post('/refuse/:bookingId', audited, asyncMiddleware(postRefusal(licenceService, nomisPushService)))

    router.get('/:formName/:bookingId', asyncMiddleware(standard.get))
    router.post('/:formName/:bookingId', audited, asyncMiddleware(standard.post))

    return router
  }

function postRefusal(licenceService, nomisPushService) {
  async function post(req, res) {
    const { bookingId } = req.params
    const { username } = req.user
    const originalLicence = res.locals.licence
    const config = formConfig.refuse
    const licenceSection = 'finalChecks'
    const { postRelease } = res.locals

    const errorObject = validateUserInput(req.body)

    if (!isEmpty(errorObject)) {
      req.flash('userInput', req.body)
      req.flash('errors', errorObject)
      return res.redirect(`/hdc/finalChecks/refuse/${bookingId}`)
    }
    const userInput = sanitiseUserInput(req.body)

    await licenceService.update({
      bookingId,
      originalLicence,
      config,
      userInput,
      licenceSection,
      formName: 'refusal',
      postRelease,
    })

    const { decision, reason } = userInput
    if (decision === 'Yes') {
      await nomisPushService.pushStatus({ bookingId, data: { type: 'refusal', status: 'Yes', reason }, username })
    }

    return res.redirect(`/hdc/taskList/${bookingId}`)
  }

  return post
}

function validateUserInput(body) {
  const errorObject = {}
  const { decision, reason, outOfTimeReasons } = body

  if (!decision) {
    errorObject.decision = 'Select Yes or No'
  }

  if (decision === 'Yes' && !reason) {
    errorObject.reason = 'Select a reason for refusing HDC'
  }

  if (decision === 'Yes' && reason === 'insufficientTime' && !outOfTimeReasons) {
    errorObject.outOfTimeReasons = 'Select reason(s) for Out of time'
  }

  return errorObject
}

function sanitiseUserInput(userInput) {
  const { reason, decision } = userInput

  if (decision === 'No') {
    return {
      decision: 'No',
    }
  }

  if (reason === 'addressUnsuitable') {
    return {
      decision: 'Yes',
      reason,
    }
  }

  return userInput
}

import { LicenceService } from '../services/licenceService'
import formConfig from './config/finalChecks'
import { asyncMiddleware } from '../utils/middleware'
import createStandardRoutes from './routeWorkers/standard'
import { isEmpty, firstItem, getIn } from '../utils/functionalHelpers'

export type ErrorObject = {
  decision?: string
  reason?: string
  outOfTimeReasons?: string
}

export default ({ licenceService, nomisPushService }: { licenceService: LicenceService; nomisPushService }) =>
  (router, audited, config) => {
    const standard = createStandardRoutes({
      formConfig,
      licenceService,
      sectionName: 'finalChecks',
      nomisPushService,
      config,
    })

    router.get('/postpone/:bookingId', asyncMiddleware(getPostpone(licenceService)))
    router.post(
      '/postpone/:bookingId',
      audited,
      asyncMiddleware(postPostpone(licenceService, nomisPushService, config))
    )

    router.post('/refuse/:bookingId', audited, asyncMiddleware(postRefusal(licenceService, nomisPushService)))

    router.get('/:formName/:bookingId', asyncMiddleware(standard.get))
    router.post('/:formName/:bookingId', audited, asyncMiddleware(standard.post))

    return router
  }

function getPostpone(licenceService) {
  function get(req, res) {
    const { bookingId, action } = req.params

    const postponeVersion = licenceService.getPostponeVersion(res.locals.licence.licence)
    const data = firstItem(req.flash('userInput')) || res.locals.licence?.licence?.finalChecks?.postpone || {}
    const errorObject = firstItem(req.flash('errors')) || {}

    const viewData = {
      bookingId,
      data,
      action,
      errorObject,
      version: postponeVersion,
    }

    if (postponeVersion === '1') {
      res.render(`finalChecks/postponeV1`, viewData)
    } else {
      res.render(`finalChecks/postponeV2`, viewData)
    }
  }
  return get
}

function postPostpone(licenceService, nomisPushService, config) {
  async function post(req, res) {
    const { bookingId } = req.params
    const { username } = req.user
    const originalLicence = res.locals.licence
    const postponeConfig = formConfig.postpone
    const { postRelease } = res.locals
    const userInput = req.body

    const updatedLicence = await licenceService.update({
      bookingId,
      originalLicence,
      config: postponeConfig,
      userInput,
      licenceSection: 'finalChecks',
      formName: 'postpone',
      postRelease,
    })

    const errors = validationErrors(updatedLicence.finalChecks.postpone, res)

    if (!isEmpty(errors)) {
      req.flash('errors', errors)
      return res.redirect(`/hdc/finalChecks/postpone/${bookingId}`)
    }

    const { decision } = userInput

    if (decision === 'Yes') {
      await pushStatus(updatedLicence, bookingId, username)
    }

    return res.redirect(`/hdc/taskList/${bookingId}`)
  }

  function validationErrors(formToValidate, res) {
    return licenceService.validateForm({
      formResponse: formToValidate,
      pageConfig: formConfig.postpone,
      formType: 'postpone',
    })
  }

  async function pushStatus(updatedLicence, bookingId, username) {
    const pushConfig = getIn(formConfig, ['postpone', 'nomisPush'])

    if (config.pushToNomis && pushConfig) {
      const status = !isEmpty(pushConfig.status) ? getIn(updatedLicence, pushConfig.status) : undefined
      const reason = !isEmpty(pushConfig.reason) ? getIn(updatedLicence, pushConfig.reason) : undefined

      const { failState = null, passState = null } = pushConfig.checksPassed ? pushConfig.checksPassed : {}

      const failed = definedAndMatches(failState, status)
      const passed = definedAndMatches(passState, status)

      // No push unless status matches for pass or fail, ie not when missing.
      // Passed/failed will always be opposite of each other.
      if (failed || passed) {
        await nomisPushService.pushChecksPassed({ bookingId, passed, username })
      }

      await nomisPushService.pushStatus({ bookingId, data: { type: 'postpone', status, reason }, username })
    }
  }

  function definedAndMatches(candidate, status) {
    if (candidate) {
      return candidate === status
    }
    return false
  }

  return post
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
  const errorObject: ErrorObject = {}
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

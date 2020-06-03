/**
 * @typedef {import("../services/prisonerService").PrisonerService} PrisonerService
 */
const logger = require('../../log.js')
const authorisationConfig = require('../routes/config/authorisation')
const { getWhereKeyLike, isEmpty } = require('./functionalHelpers')
const { unauthorisedError, forbiddenError } = require('./errors')
const { merge } = require('./functionalHelpers')
const { getLicenceStatus } = require('./licenceStatus')

module.exports = {
  asyncMiddleware,
  checkLicenceMiddleware,
  authorisationMiddleware,
  auditMiddleware,
}

function asyncMiddleware(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * @param {PrisonerService} prisonerService
 */
function checkLicenceMiddleware(licenceService, prisonerService) {
  return async (req, res, next, bookingId) => {
    try {
      const [licence, prisoner] = await Promise.all([
        licenceService.getLicence(bookingId),
        prisonerService.getPrisonerPersonalDetails(bookingId, res.locals.token),
      ])

      if (!licence || !prisoner) {
        logger.info('No licence or details available for prisoner, redirecting to caselist')
        return res.redirect('/')
      }

      const licenceStatus = getLicenceStatus(licence)

      res.locals.licence = licence
      res.locals.prisoner = prisoner
      res.locals.postRelease = prisoner.agencyLocationId ? prisoner.agencyLocationId.toUpperCase() === 'OUT' : false
      res.locals.licenceStatus = licenceStatus
      return next()
    } catch (error) {
      // TODO proper error handling
      logger.error('Error collecting licence from checkLicence')
      return res.redirect('/')
    }
  }
}

function authorisationMiddleware(req, res, next) {
  const config = getWhereKeyLike(req.originalUrl, authorisationConfig)
  if (isEmpty(config)) {
    return next()
  }

  const authorisedRole = config.authorised.find((role) => req.user.role === role.role)
  if (!authorisedRole) {
    return next(forbiddenError())
  }

  const authorisedForStage = isEmpty(authorisedRole.stage) || authorisedRole.stage.includes(res.locals.licence.stage)
  if (!authorisedForStage) {
    return next(forbiddenError())
  }

  return next()
}

function auditMiddleware(audit, key) {
  return async (req, res, next) => {
    const bookingId = req.body.bookingId || req.params.bookingId
    const inputs = userInputFrom(req.body)

    auditEvent(req.user.username, bookingId, req.originalUrl, inputs)

    next()
  }

  function userInputFrom(data) {
    const nonEmptyKeys = Object.keys(data).filter(
      (inputKey) => data[inputKey] && !['bookingId', '_csrf', 'anchor'].includes(inputKey)
    )

    return nonEmptyKeys.reduce((object, inputKey) => {
      return merge(object, { [inputKey]: data[inputKey] })
    }, {})
  }

  function auditEvent(user, bookingId, path, userInput) {
    audit.record(key, user, {
      bookingId,
      path,
      userInput,
    })
  }
}

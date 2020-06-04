import logger from '../../log'
import authorisationConfig from '../routes/config/authorisation'
import { getWhereKeyLike, isEmpty, merge } from './functionalHelpers'
import { forbiddenError } from './errors'
import { getLicenceStatus } from './licenceStatus'
import { LicenceRecord, LicenceService } from '../services/licenceService'
import { PrisonerService } from '../services/prisonerService'

export function asyncMiddleware(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export function checkLicenceMiddleware(licenceService: LicenceService, prisonerService: PrisonerService) {
  return async (req, res, next, bookingId) => {
    try {
      const [licence, prisoner] = await Promise.all<LicenceRecord, any>([
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

export function authorisationMiddleware(req, res, next) {
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

export function auditMiddleware(audit, key) {
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

  return async (req, res, next) => {
    const bookingId = req.body.bookingId || req.params.bookingId
    const inputs = userInputFrom(req.body)

    auditEvent(req.user.username, bookingId, req.originalUrl, inputs)

    next()
  }
}

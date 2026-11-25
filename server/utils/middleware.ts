import { match, MatchFunction, MatchResult, ParamData } from 'path-to-regexp'
import logger from '../../log'
import authorisationConfig from '../routes/config/authorisation'
import { getWhereKeyLike, isEmpty, merge } from './functionalHelpers'
import { forbiddenError } from './errors'
import getLicenceStatus from '../services/licence/licenceStatus'
import { LicenceRecord, LicenceService } from '../services/licenceService'
import { PrisonerService } from '../services/prisonerService'
import { LicenceStatus } from '../services/licence/licenceStatusTypes'
import getAuditPolicy from '../services/audit/routeAuditPolicy'

export function asyncMiddleware(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export type LicenceLocals = {
  licence: LicenceRecord
  prisoner: any
  postRelease: boolean
  licenceStatus: LicenceStatus
  token: string
}

export function checkLicenceMiddleware(licenceService: LicenceService, prisonerService: PrisonerService) {
  return async(req, res, next) => {
    const path = `${req.method} ${req.baseUrl}${req.path}`
    const routePolicy = getAuditPolicy(path)
    if (routePolicy && routePolicy.policy) {
      const {policy} = routePolicy
      if (policy) {
        const getRouteMatch: MatchFunction<ParamData> = match(routePolicy.route, {decode: decodeURIComponent})
        const result: MatchResult<ParamData> | false = getRouteMatch(path)
        if (result) {
          const {bookingId} = result.params
          if (bookingId) {
            try {
              const {noLicenceRequired} = policy
              const [licence, prisoner] = await Promise.all([
                licenceService.getLicence(parseInt(bookingId as string, 10)),
                prisonerService.getPrisonerPersonalDetails(parseInt(bookingId as string, 10), res.locals.token),
              ])

              if ((!licence && !noLicenceRequired) || !prisoner) {
                logger.info('No licence or details available for prisoner, redirecting to case list')
                return res.redirect('/')
              }

              if (licence) {
                const licenceStatus = getLicenceStatus(licence)
                res.locals.licence = licence
                res.locals.licenceStatus = licenceStatus
              }
              res.locals.prisoner = prisoner
              res.locals.postRelease = prisoner.agencyLocationId ? prisoner.agencyLocationId.toUpperCase() === 'OUT' : false
            } catch (error) {
              logger.error(`Error collecting licence from checkLicence: ${error}`)
              return res.redirect('/')
            }
          }
        }
      }
    } else {
      logger.error(`No route policy found for path ${path}`)
    }
    return next()
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
    const nonEmptyKeys = Object.keys(data || {}).filter(
      (inputKey) => data[inputKey] && !['bookingId', '_csrf', 'anchor'].includes(inputKey)
    )

    return nonEmptyKeys.reduce((object, inputKey) => {
      return merge(object, {[inputKey]: data[inputKey]})
    }, {})
  }

  function auditEvent(user, bookingId, path, userInput) {
    audit.record(key, user, {
      bookingId,
      path,
      userInput,
    })
  }

  return async(req, res, next) => {
    const bookingId = req.body?.bookingId || req.params?.bookingId
    const inputs = userInputFrom(req.body)

    auditEvent(req.user.username, bookingId, req.originalUrl, inputs)

    next()
  }
}

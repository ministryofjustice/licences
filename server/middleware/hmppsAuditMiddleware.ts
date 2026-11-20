import { RequestHandler } from 'express'
import getAuditPolicy from '../services/audit/routeAuditPolicy'
import AuditService from '../services/audit/auditService'
import config from '../config'
import logger from '../../log'

/**
 * Middleware to check if a route is auditable and if so call the audit service to record the audit.
 */
export function hmppsAuditMiddleware(auditService: AuditService): RequestHandler {
  return async (req, res, next) => {
    logger.error(`auditMiddleware: ${req.method} ${req.baseUrl}${req.path}`)
    if (config.sqs.audit.enabled) {
      const path = `${req.method} ${req.baseUrl}${req.path}`
      const routePolicy = getAuditPolicy(path)
      if (!routePolicy?.policy) {
        logger.error(`No audit policy found for route: ${path}`)
      } else {
        const { policy } = routePolicy
        if (policy?.audit && !policy.customHandler) {
          const { prisoner } = res.locals
          const { user } = req
          await auditService.logPageViewAttempt(req.id, prisoner, routePolicy.policy, user)
          res.prependOnceListener('finish', () => {
            if (res.statusCode === 200) {
              try {
                auditService.logPageViewSuccess(req.id, prisoner, routePolicy.policy, user)
              } catch (error) {
                logger.error(`Error logging page view success for route: ${path}`, error)
              }
            }
          })
        }
      }
    }
    next()
  }
}

/**
 * @typedef {import("../../services/prisonerService").PrisonerService} PrisonerService
 */
const express = require('express')
const { checkLicenceMiddleware, authorisationMiddleware, auditMiddleware } = require('../../utils/middleware')
const { authenticationMiddleware } = require('../../authentication/auth')

/**
 * @param {object} args
 * @param {any} args.licenceService
 * @param {PrisonerService} args.prisonerService
 * @param {any} args.audit
 * @param {any} args.signInService
 * @param {any} args.config
 */
module.exports = ({ licenceService, prisonerService, audit, signInService, config }) => {
  return (routes, { auditKey = 'UPDATE_SECTION', licenceRequired = true } = {}) => {
    const router = express.Router()
    const auditMethod = auditMiddleware(audit, auditKey)

    router.use(authenticationMiddleware(signInService))
    if (licenceRequired) {
      router.param('bookingId', checkLicenceMiddleware(licenceService, prisonerService))
    }
    router.param('bookingId', authorisationMiddleware)

    router.use((req, res, next) => {
      if (typeof req.csrfToken === 'function') {
        res.locals.csrfToken = req.csrfToken()
      }
      next()
    })

    return routes(router, auditMethod, config)
  }
}

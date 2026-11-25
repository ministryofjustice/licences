/**
 * @typedef {import("../../services/prisonerService").PrisonerService} PrisonerService
 * @typedef {import("../../authentication/tokenverifier/TokenVerifier")} TokenVerifier
 */
const express = require('express')
const { checkLicenceMiddleware, authorisationMiddleware, auditMiddleware } = require('../../utils/middleware')
const { authenticationMiddleware } = require('../../authentication/auth')
const { hmppsAuditMiddleware } = require("../../middleware/hmppsAuditMiddleware");

/**
 * @param {object} args
 * @param {any} args.auditService
 * @param {any} args.licenceService
 * @param {PrisonerService} args.prisonerService
 * @param {any} args.audit
 * @param {any} args.signInService
 * @param {TokenVerifier} args.tokenVerifier
 * @param {any} args.config
 */
module.exports = ({ auditService, licenceService, prisonerService, audit, signInService, tokenVerifier, config }) => {
  return (routes, { auditKey = 'UPDATE_SECTION'  } = {}) => {
    const router = express.Router()
    const auditMethod = auditMiddleware(audit, auditKey)

    router.use(authenticationMiddleware(signInService, tokenVerifier))
    router.use(checkLicenceMiddleware(licenceService, prisonerService))
    router.use(hmppsAuditMiddleware(auditService))
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

const express = require('express');
const {checkLicenceMiddleware, authorisationMiddleware, auditMiddleware} = require('../../utils/middleware');
const {authenticationMiddleware} = require('../../authentication/auth');

module.exports = ({licenceService, prisonerService, audit, signInService}) => (routes, auditKey = 'UPDATE_SECTION') => {

    const router = express.Router();
    const auditMethod = auditMiddleware(audit, auditKey);

    router.use(authenticationMiddleware(signInService));
    router.param('bookingId', checkLicenceMiddleware(licenceService, prisonerService));
    router.param('bookingId', authorisationMiddleware);

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    return routes(router, auditMethod);
};

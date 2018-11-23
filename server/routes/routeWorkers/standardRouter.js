const express = require('express');
const {checkLicenceMiddleWare, authorisationMiddleware, auditMiddleware} = require('../../utils/middleware');
const {authenticationMiddleware} = require('../../authentication/auth');

module.exports = ({licenceService, prisonerService, audit}) => (routes, auditKey = 'UPDATE_SECTION') => {

    const router = express.Router();
    const auditMethod = auditMiddleware(audit, auditKey);

    router.use(authenticationMiddleware());
    router.param('bookingId', checkLicenceMiddleWare(licenceService, prisonerService));
    router.param('bookingId', authorisationMiddleware);

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    return routes(router, auditMethod);
};

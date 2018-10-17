const express = require('express');
const {checkLicenceMiddleWare, authorisationMiddleware, auditMiddleware} = require('../../utils/middleware');

module.exports = ({licenceService, prisonerService, authenticationMiddleware, audit}) => routes => {

    const router = express.Router();
    const auditMethod = auditMiddleware(audit, 'UPDATE_SECTION');

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

const express = require('express');
const {async, checkLicenceMiddleWare, authorisationMiddleware, auditMiddleware} = require('../utils/middleware');
const createStandardRoutes = require('./routeWorkers/standard');

module.exports = function({licenceService, prisonerService, authenticationMiddleware, audit}) {

    const router = express.Router();
    router.use(authenticationMiddleware());
    router.param('bookingId', checkLicenceMiddleWare(licenceService, prisonerService));
    router.param('bookingId', authorisationMiddleware);

    const audited = auditMiddleware(audit, 'UPDATE_SECTION');

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    const formConfig = require('./config/eligibility');
    const standard = createStandardRoutes({formConfig, licenceService, sectionName: 'eligibility'});

    router.get('/eligibility/:formName/:bookingId', async(standard.get));
    router.post('/eligibility/:formName/:bookingId', audited, async(standard.post));

    return router;
};



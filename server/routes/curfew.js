const express = require('express');
const {async, checkLicenceMiddleWare, authorisationMiddleware, auditMiddleware} = require('../utils/middleware');
const createCurfewRoutes = require('./routeWorkers/curfew');
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

    const formConfig = require('./config/curfew');
    const curfew = createCurfewRoutes({formConfig, licenceService});
    const standard = createStandardRoutes({formConfig, licenceService, sectionName: 'curfew'});

    router.get('/curfew/curfewAddressReview/:bookingId', curfew.getCurfewAddressReview);
    router.post('/curfew/curfewAddressReview/:bookingId', audited, async(curfew.postCurfewAddressReview));

    router.get('/curfew/curfewAddressReview/:action/:bookingId', curfew.getCurfewAddressReview);
    router.post('/curfew/curfewAddressReview/:action/:bookingId', audited, async(curfew.postCurfewAddressReview));


    router.get('/curfew/addressSafety/:bookingId', curfew.getAddressSafetyReview);
    router.post('/curfew/addressSafety/:bookingId', audited, async(curfew.postAddressSafetyReview));

    router.get('/curfew/addressSafety/:action/:bookingId', curfew.getAddressSafetyReview);
    router.post('/curfew/addressSafety/:action/:bookingId', audited, async(curfew.postAddressSafetyReview));


    router.post('/curfew/withdrawAddress/:bookingId', audited, async(curfew.postWithdrawAddress));
    router.post('/curfew/withdrawConsent/:bookingId', audited, async(curfew.postWithdrawConsent));
    router.post('/curfew/reinstateAddress/:bookingId', audited, async(curfew.postReinstateAddress));

    router.get('/curfew/:formName/:bookingId', async(standard.get));
    router.post('/curfew/:formName/:bookingId', audited, async(standard.post));

    router.get('/curfew/:formName/:action/:bookingId', async(standard.get));
    router.post('/curfew/:formName/:action/:bookingId', audited, async(standard.post));

    return router;
};



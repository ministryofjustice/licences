const express = require('express');
const {async, checkLicenceMiddleWare, authorisationMiddleware, auditMiddleware} = require('../utils/middleware');
const createProposedAddressRoutes = require('./routeWorkers/proposedAddress');
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

    const formConfig = require('./config/proposedAddress');
    const proposedAddress = createProposedAddressRoutes({formConfig, licenceService});
    const standard = createStandardRoutes({formConfig, licenceService, sectionName: 'proposedAddress'});

    router.get('/proposedAddress/curfewAddress/:bookingId', proposedAddress.getAddress);

    router.get('/proposedAddress/curfewAddress/:action/:bookingId', proposedAddress.getAddress);
    router.post('/proposedAddress/curfewAddress/:action/:bookingId', audited, async(proposedAddress.postAddress));

    router.get('/proposedAddress/:formName/:bookingId', async(standard.get));
    router.post('/proposedAddress/:formName/:bookingId', audited, async(standard.post));

    return router;
};



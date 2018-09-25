const express = require('express');
const {async, checkLicenceMiddleWare, authorisationMiddleware, auditMiddleware} = require('../utils/middleware');
const createApprovalRoutes = require('./routeWorkers/approval');
const createStandardRoutes = require('./routeWorkers/standard');

module.exports = function({licenceService, conditionsService, prisonerService, authenticationMiddleware, audit}) {

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

    const formConfig = require('./config/approval');

    const approval = createApprovalRoutes({formConfig, conditionsService, licenceService, prisonerService});
    const standard = createStandardRoutes({formConfig, licenceService, sectionName: 'approval'});

    router.get('/approval/release/:bookingId', async(approval.getApprovalRelease));
    router.get('/approval/refuseReason/:bookingId', async(approval.getRefuseReason));

    router.post('/approval/:formName/:bookingId', audited, async(standard.post));

    return router;
};



const express = require('express');
const {async, checkLicenceMiddleWare, authorisationMiddleware, auditMiddleware} = require('../utils/middleware');
const createStandardRoutes = require('./routeWorkers/standard');
const {getIn, firstItem} = require('../utils/functionalHelpers');
const logger = require('../../log');

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

    router.get('/approval/release/:bookingId', async(approvalGets('release')));
    router.get('/approval/refuseReason/:bookingId', async(approvalGets('refuseReason')));

    function approvalGets(formName) {
        return async (req, res) => {
            logger.debug(`GET /approval/${formName}/`);

            const {bookingId} = req.params;
            const prisonerInfo = await prisonerService.getPrisonerDetails(bookingId, req.user.token);

            const {nextPath, pageDataMap} = formConfig[formName];
            const dataPath = pageDataMap || ['licence', 'approval', 'release'];
            const data = getIn(res.locals.licence, dataPath) || {};
            const errors = firstItem(req.flash('errors'));
            const errorObject = getIn(errors, ['approval', 'release']) || {};

            res.render(`approval/${formName}`, {
                prisonerInfo,
                bookingId,
                data,
                nextPath,
                errorObject
            });
        };
    }

    const standard = createStandardRoutes({formConfig, licenceService, sectionName: 'approval'});

    router.post('/approval/:formName/:bookingId', audited, async(standard.post));

    return router;
};



const express = require('express');
const {async, checkLicenceMiddleWare, authorisationMiddleware, auditMiddleware} = require('../utils/middleware');
const createConditionsRoutes = require('./routeWorkers/licenceConditions');
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

    const formConfig = require('./config/licenceConditions');
    const conditions = createConditionsRoutes({formConfig, conditionsService, licenceService});
    const standard = createStandardRoutes({formConfig, licenceService, sectionName: 'licenceConditions'});

    router.get('/licenceConditions/standard/:bookingId', async(conditions.getStandard));
    router.get('/licenceConditions/standard/:action/:bookingId', async(conditions.getStandard));

    router.get('/licenceConditions/additionalConditions/:bookingId', async(conditions.getAdditional));
    router.post('/licenceConditions/additionalConditions/:bookingId', audited, async(conditions.postAdditional));

    router.get('/licenceConditions/additionalConditions/:action/:bookingId', async(conditions.getAdditional));
    router.post('/licenceConditions/additionalConditions/:action/:bookingId', audited, async(conditions.postAdditional));

    router.get('/licenceConditions/conditionsSummary/:bookingId', async(conditions.getConditionsSummary));
    router.get('/licenceConditions/conditionsSummary/:action/:bookingId', async(conditions.getConditionsSummary));

    router.post('/licenceConditions/additionalConditions/:bookingId/delete/:conditionId', audited, async(conditions.postDelete));
    router.post('/licenceConditions/additionalConditions/:action/:bookingId/delete/:conditionId', audited, async(conditions.postDelete));

    router.get('/licenceConditions/:formName/:bookingId', async(standard.get));
    router.post('/licenceConditions/:formName/:bookingId', audited, async(standard.post));
    router.post('/licenceConditions/:formName/:action/:bookingId', audited, async(standard.post));

    return router;
};



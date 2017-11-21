const express = require('express');
const asyncMiddleware = require('../utils/asyncMiddleware');

module.exports = function({logger, conditionsService, licenceService}) {
    const router = express.Router();

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    router.get('/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('GET /additionalConditions');

        const nomisId = req.params.nomisId;
        const existingLicence = await licenceService.getLicence(req.params.nomisId);
        const licence = existingLicence ? existingLicence.licence : null;
        const conditions = await conditionsService.getAdditionalConditions(licence);

        return res.render('additionalConditions/index', {nomisId, conditions});
    }));

    router.post('/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('POST /additionalConditions');

        const nomisId = req.body.nomisId;

        const validationObject = await conditionsService.validateInput(req.body);
        if (!validationObject.validates) {
            // get all additional conditions
            const conditions = await conditionsService.getAdditionalConditionsWithErrors(req.body, validationObject);

            // inject user input into condition

            // return with errors

            return res.render('additionalConditions/index', {nomisId, conditions, error: true});
        }

        await licenceService.updateLicenceConditions(req.body);

        return res.redirect('/reporting/'+nomisId);
    }));

    router.get('/standard/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('GET /additionalConditions/standard');

        const nomisId = req.params.nomisId;
        const conditions = await conditionsService.getStandardConditions();

        return res.render('additionalConditions/standard', {nomisId, conditions});
    }));

    return router;
};

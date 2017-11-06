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
        const conditions = await conditionsService.getAdditionalConditions();

        return res.render('additionalConditions/index', {nomisId, conditions});
    }));

    router.post('/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('POST /additionalConditions');

        const nomisId = req.body.nomisId;
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

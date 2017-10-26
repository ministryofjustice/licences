const express = require('express');
const asyncMiddleware = require('../utils/asyncMiddleware');

module.exports = function({logger, conditionsService}) {
    const router = express.Router();

    router.get('/:nomisId', (req, res) => {
        logger.debug('GET /additionalConditions');

        const nomisId = req.params.nomisId;

        return res.render('additionalConditions/index', {nomisId});
    });

    router.get('/standard/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('GET /additionalConditions/standard');

        const nomisId = req.params.nomisId;
        const conditions = await conditionsService.getStandardConditions();

        return res.render('additionalConditions/standard', {nomisId, conditions});
    }));

    return router;
};

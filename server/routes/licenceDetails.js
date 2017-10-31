const express = require('express');
const asyncMiddleware = require('../utils/asyncMiddleware');

module.exports = function({logger, licenceService}) {
    const router = express.Router();

    router.get('/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('GET /licenceDetails');
        const details = await licenceService.getLicence(req.params.nomisId);

        res.render('licenceDetails/index', details.licence);
    }));

    return router;
};

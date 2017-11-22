const express = require('express');
const asyncMiddleware = require('../utils/asyncMiddleware');

module.exports = function({logger, licenceService, authenticationMiddleware}) {
    const router = express.Router();
    router.use(authenticationMiddleware());

    router.get('/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('GET /licenceDetails');
        const licence = await licenceService.getLicence(req.params.nomisId, {populateConditions: true});

        res.render(`licenceDetails/${req.user.roleCode}`, licence);
    }));

    return router;
};

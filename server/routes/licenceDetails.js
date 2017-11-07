const express = require('express');
const asyncMiddleware = require('../utils/asyncMiddleware');

module.exports = function({logger, licenceService, authenticationMiddleware}) {
    const router = express.Router();
    router.use(authenticationMiddleware());

    router.get('/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('GET /licenceDetails');
        const details = await licenceService.getLicence(req.params.nomisId);

        res.render(`licenceDetails/${req.user.roleCode}`, details);
    }));

    return router;
};

const express = require('express');
const {getIn} = require('../utils/functionalHelpers');
const asyncMiddleware = require('../utils/asyncMiddleware');

module.exports = function({logger, licenceService, authenticationMiddleware}) {
    const router = express.Router();
    router.use(authenticationMiddleware());

    router.get('/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('GET /licenceDetails');
        const {nomisId} = req.params;
        const licence = await licenceService.getLicence(nomisId, {populateConditions: true});

        res.render(`licenceDetails/licenceDetails`, {nomisId, licence: getIn(licence, ['licence'])});
    }));

    return router;
};

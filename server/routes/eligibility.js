const express = require('express');
const asyncMiddleware = require('../utils/asyncMiddleware');
const {getIn} = require('../utils/functionalHelpers');

module.exports = function({logger, licenceService, authenticationMiddleware}) {
    const router = express.Router();
    router.use(authenticationMiddleware());

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    router.get('/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('GET /eligibility/:nomisId');

        const nomisId = req.params.nomisId;
        const rawLicence = await licenceService.getLicence(nomisId);
        const eligibility = getIn(rawLicence, ['licence', 'eligibility']);

        res.render('eligibility/index', {nomisId: req.params.nomisId, eligibility});
    }));

    router.post('/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('POST /eligibility/:nomisId');

        const nomisId = req.params.nomisId;
        const existingLicence = await licenceService.getLicence(nomisId);
        if (!existingLicence) await licenceService.createLicence(nomisId, req.body);

        await licenceService.updateEligibility(req.body);

        res.redirect('/hdc/taskList/' + nomisId);
    }));


    return router;
};

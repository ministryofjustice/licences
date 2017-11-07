const express = require('express');
const asyncMiddleware = require('../utils/asyncMiddleware');

module.exports = function({logger, prisonerDetailsService, licenceService, authenticationMiddleware}) {
    const router = express.Router();
    router.use(authenticationMiddleware());

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    router.get('/:nomisId', asyncMiddleware(async (req, res, next) => {
        logger.debug('GET /details');

        const nomisId = req.params.nomisId;

        const prisonerInfo = await prisonerDetailsService.getPrisonerDetails(nomisId, req.user.token);

        const details = {
            prisonerInfo,
            moment: require('moment'),
            setCase: require('case')
        };

        res.render(`details/${req.user.roleCode}`, details);
    }));

    router.post('/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('POST /details');

        const nomisId = req.body.nomisId;

        const existingLicence = await licenceService.getLicence(nomisId);

        if (!existingLicence) {
            await licenceService.createLicence(nomisId, req.body);
        }

        res.redirect('/dischargeAddress/'+nomisId);
    }));

    return router;
};

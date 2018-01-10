const express = require('express');
const asyncMiddleware = require('../utils/asyncMiddleware');

module.exports = function({logger, prisonerService, licenceService, authenticationMiddleware}) {
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

        const prisonerInfo = await prisonerService.getPrisonerDetails(nomisId, req.user.token);

        res.render(`taskList/index`, {prisonerInfo});
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

    router.get('/image/:imageId', asyncMiddleware(async (req, res) => {
        logger.debug('GET /image');

        const prisonerImage = await prisonerService.getPrisonerImage(req.params.imageId, req.user.token);

        res.send({...prisonerImage});
    }));

    return router;
};

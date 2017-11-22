const express = require('express');
const asyncMiddleware = require('../utils/asyncMiddleware');

module.exports = function({logger, dischargeAddressService, licenceService, authenticationMiddleware}) {
    const router = express.Router();
    router.use(authenticationMiddleware());

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    router.get('/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('GET /dischargeAddress');

        const nomisId = req.params.nomisId;
        const rawLicence = await licenceService.getLicence(nomisId);
        const licence = rawLicence && rawLicence.licence || null;

        if(!licence) {
            return res.redirect(`/details/${nomisId}`);
        }

        const {dischargeAddress} = licence;

        res.render('dischargeAddress/index', {nomisId, dischargeAddress});
    }));

    router.post('/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('POST /dischargeAddress');

        const nomisId = req.body.nomisId;

        await licenceService.updateAddress(req.body);

        res.redirect('/additionalConditions/'+nomisId);
    }));

    return router;
};


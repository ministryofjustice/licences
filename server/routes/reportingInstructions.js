const express = require('express');
const asyncMiddleware = require('../utils/asyncMiddleware');

module.exports = function({licenceService, logger}) {
    const router = express.Router();

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    router.get('/:nomisId', (req, res) => {
        res.render('reportingInstructions/index', {nomisId: req.params.nomisId});
    });

    router.post('/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('POST /dischargeAddress');

        const nomisId = req.params.nomisId;
        const licence = await licenceService.getLicence(nomisId);

        if(licence.length < 1) {
            return res.redirect(`/details/${nomisId}`);
        }

        await licenceService.updateReportingInstructions(req.body);

        res.redirect('/licenceDetails/'+nomisId);
    }));

    return router;
};

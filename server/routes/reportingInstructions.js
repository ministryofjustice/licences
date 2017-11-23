const express = require('express');
const asyncMiddleware = require('../utils/asyncMiddleware');
const {getIn} = require('../utils/functionalHelpers');

module.exports = function({licenceService, logger, authenticationMiddleware}) {
    const router = express.Router();
    router.use(authenticationMiddleware());

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    router.get('/:nomisId', asyncMiddleware(async (req, res) => {

        const nomisId = req.params.nomisId;
        const rawLicence = await licenceService.getLicence(nomisId);
        const licence = getIn(rawLicence, ['licence']);

        if(!licence) {
            return res.redirect(`/details/${nomisId}`);
        }

        const {reportingInstructions} = licence;

        res.render('reportingInstructions/index', {nomisId, reportingInstructions});
    }));

    router.post('/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('POST /reportingInstructions');

        const nomisId = req.params.nomisId;

        await licenceService.updateReportingInstructions(req.body);

        res.redirect('/licenceDetails/'+nomisId);
    }));

    return router;
};

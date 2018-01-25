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

    router.get('/bass/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('GET /address/bass/:nomisId');

        const nomisId = req.params.nomisId;
        const bassReferral = await getFromLicence(nomisId, licenceService);

        res.render('address/bassReferral', {nomisId: req.params.nomisId, bassReferral});
    }));

    router.post(['/bass/:nomisId'], asyncMiddleware(async (req, res) => {
        logger.debug('POST /address/bass/:nomisId');

        const nomisId = req.params.nomisId;
        await updateFromSubmission(nomisId, req.body, licenceService);

        res.redirect('/hdc/taskList/' + nomisId);
    }));

    return router;
};

async function updateFromSubmission(nomisId, body, licenceService) {
    const existingLicence = await licenceService.getLicence(nomisId);
    if (!existingLicence) throw new Error('Bass referral without a licence');

    await licenceService.updateBassReferral(body);
}

async function getFromLicence(nomisId, licenceService) {
    const rawLicence = await licenceService.getLicence(nomisId);
    return getIn(rawLicence, ['licence', 'bassReferral']);
}

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
        const eligibility = await getEligibilityFromLicence(nomisId, licenceService);

        res.render('eligibility/excludedForm', {nomisId: req.params.nomisId, eligibility});
    }));

    router.post('/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('POST /eligibility/:nomisId');

        const nomisId = req.params.nomisId;
        await updateEligibilityFromSubmission(nomisId, req.body, licenceService);

        res.redirect('suitability/' + nomisId);
    }));

    router.get('/suitability/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('GET /eligibility/suitability/:nomisId');

        const nomisId = req.params.nomisId;
        const eligibility = await getEligibilityFromLicence(nomisId, licenceService);

        res.render('eligibility/suitabilityForm', {nomisId: req.params.nomisId, eligibility});
    }));

    router.post(['/suitability/:nomisId'], asyncMiddleware(async (req, res) => {
        logger.debug('POST /eligibility/suitability/:nomisId');

        const nomisId = req.params.nomisId;
        await updateEligibilityFromSubmission(nomisId, req.body, licenceService);

        res.redirect('/hdc/eligibility/crdTime/' + nomisId);
    }));

    router.get('/crdTime/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('GET /eligibility/crdTime/:nomisId');

        const nomisId = req.params.nomisId;
        const eligibility = await getEligibilityFromLicence(nomisId, licenceService);

        res.render('eligibility/crdTimeForm', {nomisId: req.params.nomisId, eligibility});
    }));

    router.post(['/crdTime/:nomisId'], asyncMiddleware(async (req, res) => {
        logger.debug('POST /eligibility/crdTime/:nomisId');

        const nomisId = req.params.nomisId;
        await updateEligibilityFromSubmission(nomisId, req.body, licenceService);

        res.redirect('/hdc/taskList/' + nomisId);
    }));

    return router;
};

async function updateEligibilityFromSubmission(nomisId, body, licenceService) {
    const existingLicence = await licenceService.getLicence(nomisId);
    if (!existingLicence) {
        await licenceService.createLicence(nomisId, body);
    }

    return licenceService.updateEligibility(body, getIn(existingLicence, ['licence', 'eligibility']));
}

async function getEligibilityFromLicence(nomisId, licenceService) {
    const rawLicence = await licenceService.getLicence(nomisId);
    return getIn(rawLicence, ['licence', 'eligibility']);
}

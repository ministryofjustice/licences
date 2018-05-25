const express = require('express');
const {getIn} = require('../utils/functionalHelpers');
const {licenceStages} = require('../models/licenceStages');
const {asyncMiddleware} = require('../utils/middleware');

module.exports = function({logger, licenceService, prisonerService, authenticationMiddleware}) {
    const router = express.Router();
    router.use(authenticationMiddleware());

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    router.get('/:nomisId', asyncMiddleware(async (req, res) => {
        const {nomisId} = req.params;
        const licence = await licenceService.getLicence(nomisId);
        const stage = getIn(licence, ['stage']);
        const personalDetails = getIn(licence, ['licence', 'personalDetails']) || {};
        const submissionTarget = await getSubmissionTarget(nomisId, stage, req.user.token);

        res.render('send/index', {nomisId, stage, submissionTarget, personalDetails});
    }));

    router.post('/:nomisId', asyncMiddleware(async (req, res) => {
        const {nomisId, sender, receiver} = req.body;
        const licence = await licenceService.getLicence(nomisId);
        await licenceService.markForHandover(nomisId, sender, receiver, licence);
        res.redirect('/hdc/sent/' + nomisId);
    }));

    function getSubmissionTarget(nomisId, stage, token) {
        switch (stage) {
            case licenceStages.ELIGIBILITY:
                return prisonerService.getComForPrisoner(nomisId, token);
            case licenceStages.PROCESSING_RO:
                return prisonerService.getEstablishmentForPrisoner(nomisId, token);
            default:
                return null;
        }
    }

    return router;
};



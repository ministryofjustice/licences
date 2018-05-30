const express = require('express');
const {getIn} = require('../utils/functionalHelpers');
const {licenceStages} = require('../models/licenceStages');
const {asyncMiddleware, checkLicenceMiddleWare} = require('../utils/middleware');

module.exports = function({logger, licenceService, prisonerService, authenticationMiddleware}) {
    const router = express.Router();
    router.use(authenticationMiddleware());

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    const checkLicence = checkLicenceMiddleWare(licenceService, prisonerService);

    router.get('/:nomisId', checkLicence, asyncMiddleware(async (req, res) => {
        const {nomisId} = req.params;
        const licence = await licenceService.getLicence(nomisId);
        const stage = getIn(licence, ['stage']);
        const submissionTarget = await getSubmissionTarget(nomisId, stage, {tokenId: req.user.username});

        res.render('send/index', {nomisId, stage, submissionTarget});
    }));

    router.post('/:nomisId', asyncMiddleware(async (req, res) => {
        const {nomisId, sender, receiver} = req.body;
        const licence = await licenceService.getLicence(nomisId);
        await licenceService.markForHandover(nomisId, sender, receiver, licence);
        res.redirect('/hdc/sent/' + nomisId);
    }));

    function getSubmissionTarget(nomisId, stage, {tokenId}) {
        switch (stage) {
            case licenceStages.ELIGIBILITY:
                return prisonerService.getComForPrisoner(nomisId, {tokenId});
            case licenceStages.PROCESSING_RO:
                return prisonerService.getEstablishmentForPrisoner(nomisId, {tokenId});
            default:
                return null;
        }
    }

    return router;
};



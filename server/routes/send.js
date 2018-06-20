const express = require('express');
const {getIn} = require('../utils/functionalHelpers');
const {licenceStages} = require('../models/licenceStages');
const {getLicenceStatus} = require('../utils/licenceStatus');
const {getAllowedTransitions} = require('../utils/licenceStatusTransitions');

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
        const licenceStatus = getLicenceStatus(licence);
        const allowedTransitions = getAllowedTransitions(licenceStatus, req.user.role);
        const submissionTarget = await getSubmissionTarget(nomisId, stage, req.user.username);

        res.render('send/index', {nomisId, stage, submissionTarget, allowedTransitions});
    }));

    router.post('/:nomisId', asyncMiddleware(async (req, res) => {
        const {nomisId, sender, receiver, transitionType} = req.body;
        const licence = await licenceService.getLicence(nomisId);
        await licenceService.markForHandover(nomisId, sender, receiver, licence);

        res.redirect(`/hdc/sent/${transitionType}`);
    }));

    function getSubmissionTarget(nomisId, stage, username) {
        switch (stage) {
            case licenceStages.ELIGIBILITY:
                return prisonerService.getComForPrisoner(nomisId, username);
            case licenceStages.PROCESSING_RO:
                return prisonerService.getEstablishmentForPrisoner(nomisId, username);
            default:
                return null;
        }
    }

    return router;
};



const express = require('express');
const {getIn} = require('../utils/functionalHelpers');
const {getLicenceStatus} = require('../utils/licenceStatus');
const {getAllowedTransition} = require('../utils/licenceStatusTransitions');

const {asyncMiddleware, checkLicenceMiddleWare} = require('../utils/middleware');

module.exports = function({logger, licenceService, prisonerService, authenticationMiddleware, audit}) {
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
        const transitionType = getAllowedTransition(licenceStatus, req.user.role);
        const submissionTarget = await getSubmissionTarget(transitionType, nomisId, req.user.username);

        res.render('send/index', {nomisId, stage, submissionTarget, transitionType});
    }));

    router.post('/:nomisId', asyncMiddleware(async (req, res) => {
        const {nomisId, sender, receiver, transitionType, submissionTarget} = req.body;
        const licence = await licenceService.getLicence(nomisId);
        await licenceService.markForHandover(nomisId, sender, receiver, licence);

        audit.record('SEND', req.user.staffId, {nomisId, sender, receiver, transitionType, submissionTarget});

        res.redirect(`/hdc/sent/${transitionType}`);
    }));

    function getSubmissionTarget(transitionType, nomisId, username) {

        if (transitionType === 'caToRo') {
            return prisonerService.getComForPrisoner(nomisId, username);
        }

        if (transitionType === 'roToCa') {
            return prisonerService.getEstablishmentForPrisoner(nomisId, username);
        }

        return null;
    }

    return router;
};



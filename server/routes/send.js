const express = require('express');

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

    router.get('/:destination/:nomisId', checkLicence, async (req, res) => {
        const {destination, nomisId} = req.params;

        const transitionForDestination = {
            addressReview: 'caToRo',
            finalChecks: 'roToCa',
            approval: 'caToDm',
            decided: 'dmToCa',
            'return': 'dmToCaReturn',
            refusal: 'caToDmRefusal'
        };

        const transition = transitionForDestination[destination];
        const submissionTarget = await getSubmissionTarget(transition, nomisId, req.user.username);

        res.render('send/' + transition, {nomisId, submissionTarget});
    });

    router.post('/', asyncMiddleware(async (req, res) => {
        const {nomisId, sender, receiver, transitionType, submissionTarget} = req.body;
        const licence = await licenceService.getLicence(nomisId);

        // TODO check the transition can occur

        await licenceService.markForHandover(nomisId, sender, receiver, licence, transitionType);

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


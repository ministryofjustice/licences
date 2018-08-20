const express = require('express');

const {asyncMiddleware, checkLicenceMiddleWare, authorisationMiddleware} = require('../utils/middleware');

module.exports = function({logger, licenceService, prisonerService, authenticationMiddleware, audit}) {
    const router = express.Router();
    router.use(authenticationMiddleware());
    router.param('nomisId', checkLicenceMiddleWare(licenceService, prisonerService));
    router.param('nomisId', authorisationMiddleware);

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    router.get('/:destination/:nomisId', async (req, res) => {
        const {destination, nomisId} = req.params;

        const transitionForDestination = {
            addressReview: 'caToRo',
            finalChecks: 'roToCa',
            approval: 'caToDm',
            decided: 'dmToCa',
            'return': 'dmToCaReturn',
            refusal: 'caToDmRefusal',
            addressRejected: 'roToCaAddressRejected',
            optedOut: 'roToCaOptedOut'
        };

        const transition = transitionForDestination[destination];
        const submissionTarget = await getSubmissionTarget(transition, bookingId, req.user.token);

        res.render('send/' + transition, {bookingId, submissionTarget});
    });

    router.post('/:destination/:nomisId', asyncMiddleware(async (req, res) => {
        const {nomisId, transitionType, submissionTarget} = req.body;
        const licence = await licenceService.getLicence(nomisId);

        await licenceService.markForHandover(bookingId, licence, transitionType);

        audit.record('SEND', req.user.staffId, {bookingId, transitionType, submissionTarget});

        res.redirect(`/hdc/sent/${transitionType}`);
    }));

    function getSubmissionTarget(transitionType, bookingId, token) {

        if (transitionType === 'caToRo') {
            return prisonerService.getCom(bookingId, token);
        }

        if (transitionType === 'roToCa') {
            return prisonerService.getEstablishmentForPrisoner(bookingId, token);
        }

        return null;
    }

    return router;
};


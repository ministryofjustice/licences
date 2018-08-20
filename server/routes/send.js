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

    router.get('/:destination/:bookingId', checkLicence, async (req, res) => {
        const {destination, bookingId} = req.params;

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

    router.post('/', asyncMiddleware(async (req, res) => {
        const {bookingId, transitionType, submissionTarget} = req.body;
        const licence = await licenceService.getLicence(bookingId);

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


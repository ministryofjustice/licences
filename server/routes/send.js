const express = require('express');

const {async, checkLicenceMiddleWare, authorisationMiddleware, auditMiddleware} =
    require('../utils/middleware');

module.exports = function({logger, licenceService, prisonerService, authenticationMiddleware, audit}) {
    const router = express.Router();
    router.use(authenticationMiddleware());
    router.param('bookingId', checkLicenceMiddleWare(licenceService, prisonerService));
    router.param('bookingId', authorisationMiddleware);

    const audited = auditMiddleware(audit, 'SEND');

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    router.get('/:destination/:bookingId', async (req, res) => {
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

    router.post('/:destination/:bookingId', audited, async(async (req, res) => {
        const {bookingId, transitionType} = req.body;
        const licence = await licenceService.getLicence(bookingId);

        await licenceService.markForHandover(bookingId, licence, transitionType);

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


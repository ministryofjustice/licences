const express = require('express');

const {async, checkLicenceMiddleWare, authorisationMiddleware} = require('../utils/middleware');

module.exports = function({licenceService, prisonerService, authenticationMiddleware, audit}) {
    const router = express.Router();
    router.use(authenticationMiddleware());
    router.param('bookingId', checkLicenceMiddleWare(licenceService, prisonerService));
    router.param('bookingId', authorisationMiddleware);

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    router.get('/:destination/:bookingId', async (req, res) => {
        const {destination, bookingId} = req.params;
        const transition = transitionForDestination[destination];
        const submissionTarget = await getSubmissionTarget(transition.receiver, bookingId, req.user.token);

        res.render('send/' + transition.type, {bookingId, submissionTarget});
    });

    router.post('/:destination/:bookingId', async(async (req, res) => {
        const {destination, bookingId} = req.params;
        const transition = transitionForDestination[destination];

        const [licence, submissionTarget] = await Promise.all([
            licenceService.getLicence(bookingId),
            getSubmissionTarget(transition.receiver, bookingId, req.user.token)
        ]);

        await licenceService.markForHandover(bookingId, licence, transition.type);
        auditEvent(req.user.staffId, bookingId, transition.type, submissionTarget);

        res.redirect(`/hdc/sent/${transition.receiver}/${transition.type}/${bookingId}`);
    }));

    const transitionForDestination = {
        addressReview: {type: 'caToRo', receiver: 'RO'},
        finalChecks: {type: 'roToCa', receiver: 'CA'},
        approval: {type: 'caToDm', receiver: 'DM'},
        decided: {type: 'dmToCa', receiver: 'CA'},
        'return': {type: 'dmToCaReturn', receiver: 'CA'},
        refusal: {type: 'caToDmRefusal', receiver: 'DM'},
        addressRejected: {type: 'roToCaAddressRejected', receiver: 'CA'},
        optedOut: {type: 'roToCaOptedOut', receiver: 'CA'}
    };

    function getSubmissionTarget(target, bookingId, token) {
        return prisonerService.getOrganisationContactDetails(target, bookingId, token);
    }

    function auditEvent(user, bookingId, transitionType, submissionTarget) {
        audit.record('SEND', user, {
            bookingId,
            transitionType,
            submissionTarget
        });
    }

    return router;
};


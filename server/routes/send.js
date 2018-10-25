const express = require('express');
const {asyncMiddleware, checkLicenceMiddleWare, authorisationMiddleware} = require('../utils/middleware');
const {notifyKey} = require('../config');

module.exports = function({licenceService, prisonerService, authenticationMiddleware, notificationService, audit}) {
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
        const submissionTarget = await prisonerService.getOrganisationContactDetails(transition.receiver, bookingId, req.user.token);

        res.render('send/' + transition.type, {bookingId, submissionTarget});
    });

    router.post('/:destination/:bookingId', asyncMiddleware(async (req, res) => {
        const {destination, bookingId} = req.params;
        const transition = transitionForDestination[destination];

        const [licence, submissionTarget] = await Promise.all([
            licenceService.getLicence(bookingId),
            prisonerService.getOrganisationContactDetails(transition.receiver, bookingId, req.user.token)
        ]);

        await Promise.all([
            licenceService.markForHandover(bookingId, licence, transition.type),
            notifyRecipient(transition.type)
        ]);

        auditEvent(req.user.staffId, bookingId, transition.type, submissionTarget);

        res.redirect(`/hdc/sent/${transition.receiver}/${transition.type}/${bookingId}`);
    }));

    const transitionForDestination = {
        addressReview: {type: 'caToRo', receiver: 'RO'},
        bassReview: {type: 'caToRo', receiver: 'RO'},
        finalChecks: {type: 'roToCa', receiver: 'CA'},
        approval: {type: 'caToDm', receiver: 'DM'},
        decided: {type: 'dmToCa', receiver: 'CA'},
        'return': {type: 'dmToCaReturn', receiver: 'CA'},
        refusal: {type: 'caToDmRefusal', receiver: 'DM'},
        addressRejected: {type: 'roToCaAddressRejected', receiver: 'CA'},
        bassAreaRejected: {type: 'roToCaAddressRejected', receiver: 'CA'},
        optedOut: {type: 'roToCaOptedOut', receiver: 'CA'}
    };

    function auditEvent(user, bookingId, transitionType, submissionTarget) {
        audit.record('SEND', user, {
            bookingId,
            transitionType,
            submissionTarget
        });
    }

    function notifyRecipient(transitionType) {
        if (!notifyKey) {
            return;
        }

        if (transitionType === 'caToRo') {
            return notificationService.notifyRoOfNewCase('Matthew');
        }
    }

    return router;
};


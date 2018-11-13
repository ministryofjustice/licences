const express = require('express');

const {asyncMiddleware} = require('../utils/middleware');

module.exports = function({licenceService, prisonerService, authenticationMiddleware}) {
    const router = express.Router();

    router.use(authenticationMiddleware());

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    router.get('/:receiver/:type/:bookingId', asyncMiddleware(async (req, res) => {
        const {receiver, type, bookingId} = req.params;
        const submissionTarget = await prisonerService.getOrganisationContactDetails(receiver, bookingId, req.user.token);

        res.render(`sent/${type}`, {submissionTarget});
    }));

    return router;
};

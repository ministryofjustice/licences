const express = require('express');
const {getIn} = require('../utils/functionalHelpers');
const {states} = require('../data/licenceStates');
const asyncMiddleware = require('../utils/asyncMiddleware');

module.exports = function({logger, licenceService, prisonerService, authenticationMiddleware}) {
    const router = express.Router();
    router.use(authenticationMiddleware());

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    router.get('/:nomisId', asyncMiddleware(async (req, res) => {
        const {nomisId} = req.params;
        const licence = await licenceService.getLicence(nomisId);
        const status = getIn(licence, ['status']);
        const submissionTarget = await getSubmissionTarget(nomisId, status, req.user.token);

        res.render('send/index', {nomisId, status, submissionTarget});
    }));

    router.post('/:nomisId', asyncMiddleware(async (req, res) => {
        const {nomisId, sender, receiver} = req.body;
        await licenceService.markForHandover(nomisId, sender, receiver);
        res.redirect('/hdc/sent/' + nomisId);
    }));

    function getSubmissionTarget(nomisId, status, token) {
        switch (status) {
            case states.PROCESSING_RO:
                return prisonerService.getEstablishmentForPrisoner(nomisId, token);
            default:
                return null;
        }
    }

    return router;
};

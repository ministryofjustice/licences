const express = require('express');
const asyncMiddleware = require('../utils/asyncMiddleware');
const {getIn} = require('../utils/functionalHelpers');

module.exports = function({logger, licenceService, authenticationMiddleware}) {
    const router = express.Router();
    router.use(authenticationMiddleware());

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    router.get('/optOut/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('GET proposedAddress/optOut/:nomisId');

        const nomisId = req.params.nomisId;
        const rawLicence = await licenceService.getLicence(nomisId);
        const optOut = getIn(rawLicence, ['licence', 'optOut']);

        res.render('proposedAddress/optOutForm', {nomisId, optOut});
    }));

    router.post('/optOut/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('GET proposedAddress/optOut/:nomisId');

        const {nomisId} = req.body;
        await licenceService.updateOptOut(req.body);

        res.redirect('/hdc/taskList/' + nomisId);
    }));


    return router;
};

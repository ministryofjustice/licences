const express = require('express');
const asyncMiddleware = require('../utils/asyncMiddleware');

module.exports = function({logger, licenceService, authenticationMiddleware}) {
    const router = express.Router();
    router.use(authenticationMiddleware());

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    router.get('/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('GET /send');

        res.render('send/index', {nomisId: req.params.nomisId});
    }));

    router.post('/:nomisId', asyncMiddleware(async (req, res) => {
        logger.debug('POST /send');

        const nomisId = req.body.nomisId;

        const existingLicence = await licenceService.getLicence(nomisId);

        if (existingLicence.length === 0) {
            throw new Error('No such licence');
        }

        await licenceService.send(nomisId);

        res.redirect('/');
    }));

    return router;
};

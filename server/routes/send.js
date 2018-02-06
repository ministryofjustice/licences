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

        res.render('send/', {nomisId: req.params.nomisId});
    }));

    router.post('/omu/', asyncMiddleware(async (req, res) => {
        logger.debug('POST /send/omu');

        const nomisId = req.body.nomisId;

        await licenceService.sendToOmu(nomisId);

        res.redirect('/sent/'+nomisId);
    }));

    router.post('/pm/', asyncMiddleware(async (req, res) => {
        logger.debug('POST /send/pm');

        const nomisId = req.body.nomisId;

        await licenceService.sendToPm(nomisId);

        res.redirect('/sent/'+nomisId);
    }));

    return router;
};

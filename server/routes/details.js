const express = require('express');
const asyncMiddleware = require('../utils/asyncMiddleware');

module.exports = function({logger, prisonerDetailsService}) {
    const router = express.Router();

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    router.get('/:nomisId', asyncMiddleware(async (req, res, next) => {
        logger.debug('GET /details');

        const nomisId = req.params.nomisId;

        const prisonerInfo = await prisonerDetailsService.getPrisonerDetails(nomisId);

        const details = {
            prisonerInfo,
            moment: require('moment')
        };

        res.render('details/index', details);
    }));

    router.post('/:nomisId', (req, res) => {
        logger.debug('POST /details');

        res.redirect('/dischargeAddress/'+req.params.licenceId);
    });

    return router;
};

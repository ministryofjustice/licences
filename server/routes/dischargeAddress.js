const express = require('express');

module.exports = function({logger, dischargeAddressService}) {
    const router = express.Router();

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    router.get('/:licenceId', (req, res) => {
        logger.debug('GET /dischargeAddress');
        const details = dischargeAddressService.getDischargeAddress();

        res.render('dischargeAddress/index', details);
    });

    router.post('/:licenceId', (req, res) => {
        logger.debug('POST /dischargeAddress');

        res.redirect('/additionalConditions/'+req.params.licenceId);
    });

    return router;
};


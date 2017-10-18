const express = require('express');

module.exports = function({logger, licenceService}) {
    const router = express.Router();

    router.get('/:nomisId', (req, res) => {
        logger.debug('GET /licenceDetails');
        const details = licenceService.getLicence(req.params.nomisId);

        res.render('licenceDetails/index', details);
    });

    return router;
};

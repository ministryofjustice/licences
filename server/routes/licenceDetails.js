const express = require('express');

module.exports = function({logger, licenceDetailsService}) {
    const router = express.Router();

    router.get('/:licenceId', (req, res) => {
        logger.debug('GET /licenceDetails');
        const details = licenceDetailsService.getLicenceDetails();

        res.render('licenceDetails/index', details);
    });

    return router;
};

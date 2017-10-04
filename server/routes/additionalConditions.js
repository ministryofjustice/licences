const express = require('express');

module.exports = function({logger}) {
    const router = express.Router();

    router.get('/:licenceId', (req, res) => {
        logger.debug('GET /additionalConditions');

        return res.render('additionalConditions/index', {licenceId: req.params.licenceId});
    });

    return router;
};

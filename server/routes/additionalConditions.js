const express = require('express');

module.exports = function({logger}) {
    const router = express.Router();

    router.get('/:nomisId', (req, res) => {
        logger.debug('GET /additionalConditions');

        return res.render('additionalConditions/index', {nomisId: req.params.nomisId});
    });

    return router;
};

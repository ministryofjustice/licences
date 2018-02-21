const express = require('express');
const asyncMiddleware = require('../utils/middleware');

module.exports = function({logger, licenceService}) {
    const router = express.Router();

    router.get('/reset', asyncMiddleware(async (req, res, next) => {
        logger.debug('Resetting licence database');

        await licenceService.reset();

        res.redirect('/');
    }));

    return router;
};

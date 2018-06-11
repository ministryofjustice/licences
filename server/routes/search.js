const express = require('express');
const {asyncMiddleware} = require('../utils/middleware');
const {parseSearchTerms} = require('../utils/searchParser');

module.exports = function({logger, searchService, authenticationMiddleware}) {
    const router = express.Router();
    router.use(authenticationMiddleware());

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    router.get('/offender', asyncMiddleware(async (req, res) => {
        logger.debug('GET /search/offender');
        res.render('search/offender');
    }));

    router.post(['/offender', '/offender/results'], asyncMiddleware(async (req, res) => {
        logger.debug('POST /search/offender');

        const {searchTerm} = req.body;
        const {error, query} = parseSearchTerms(searchTerm);

        if (error) {
            return res.render('search/offender', {error});
        }

        res.redirect('/hdc/search/offender/results?' + query);
    }));

    router.get('/offender/results', asyncMiddleware(async (req, res) => {
        logger.debug('GET /search/offender/results');

        const hdcEligible = await searchService.searchOffenders(req.query.nomisId, req.user.username, req.user.role);

        res.render('search/results', {hdcEligible});
    }));

    return router;
};



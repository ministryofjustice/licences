const express = require('express');

const {async} = require('../utils/middleware');
const {parseSearchTerms} = require('../utils/searchParser');

module.exports = function({searchService, authenticationMiddleware}) {
    const router = express.Router();
    router.use(authenticationMiddleware());

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    router.get('/offender', (req, res) => {
        res.render('search/offender');
    });

    router.post(['/offender', '/offender/results'], (req, res) => {
        const {searchTerm} = req.body;
        const {error, query} = parseSearchTerms(searchTerm);

        if (error) {
            return res.render('search/offender', {error});
        }

        res.redirect('/hdc/search/offender/results?' + query);
    });

    router.get('/offender/results', async(async (req, res) => {
        const hdcEligible = await searchService.searchOffenders(req.query.nomisId, req.user.token, req.user.role);
        res.render('search/results', {hdcEligible});
    }));

    return router;
};



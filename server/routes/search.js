const {asyncMiddleware} = require('../utils/middleware');
const {parseSearchTerms} = require('../utils/searchParser');

module.exports = ({searchService, authenticationMiddleware}) => router => {
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

    router.get('/offender/results', asyncMiddleware(async (req, res) => {
        const hdcEligible = await searchService.searchOffenders(req.query.nomisId, res.locals.token, req.user.role);
        res.render('search/results', {hdcEligible});
    }));

    return router;
};



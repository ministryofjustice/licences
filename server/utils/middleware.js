const logger = require('../../log.js');
module.exports = {
    asyncMiddleware,
    checkLicenceMiddleWare
};

function asyncMiddleware(fn) {
    return (req, res, next) => {
        Promise
            .resolve(fn(req, res, next))
            .catch(next);
    };
}

function checkLicenceMiddleWare(licenceService, prisonerService) {
    return async (req, res, next) => {
        try {

            const bookingId = req.params.bookingId;

            const [licence, prisoner] = await Promise.all([
                licenceService.getLicence(bookingId),
                prisonerService.getPrisonerPersonalDetails(bookingId, req.user.token)
            ]);

            if (!licence || !prisoner) {
                return res.redirect('/');
            }

            res.locals.licence = licence;
            res.locals.prisoner = prisoner;
            next();

        } catch (error) {
            // TODO proper error handling
            logger.error('Error collecting licence from checkLicence');
            res.redirect('/');
        }
    };
}

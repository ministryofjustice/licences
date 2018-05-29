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

            const nomisId = req.params.nomisId;

            const getLicence = licenceService.getLicence(nomisId);
            const getPrisoner = prisonerService.getPrisonerPersonalDetails(nomisId, req.user.token);
            const details = await Promise.all([getLicence, getPrisoner]);

            if (!details[0] || !details[1]) {
                return res.redirect('/');
            }

            res.locals.licence = details[0];
            res.locals.prisoner = details[1];
            next();

        } catch (error) {
            // TODO proper error handling
            logger.error('Error collecting licence from checkLicence');
            res.redirect('/');
        }
    };
}

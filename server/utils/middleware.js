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

function checkLicenceMiddleWare(licenceService) {
    return async (req, res, next) => {
        try {

            const nomisId = req.params.nomisId;
            const licence = await licenceService.getLicence(nomisId);

            if (!licence) {
                return res.redirect('/');
            }

            res.locals.licence = licence;
            next();

        } catch (error) {
            // TODO proper error handling
            logger.error('Error collecting licence from checkLicence');
            res.redirect('/');
        }
    };
}

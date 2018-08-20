const logger = require('../../log.js');
const authorisationConfig = require('../routes/config/authorisation');
const {getWhereKeyLike, isEmpty} = require('../utils/functionalHelpers');

module.exports = {
    asyncMiddleware,
    checkLicenceMiddleWare,
    authorisationMiddleware
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

            const [licence, prisoner] = await Promise.all([
                licenceService.getLicence(nomisId),
                prisonerService.getPrisonerPersonalDetails(nomisId, req.user.token)
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

function authorisationMiddleware(req, res, next) {
    const config = getWhereKeyLike(req.path, authorisationConfig);

    const unauthorised = !isEmpty(config) && !config.authorisedRoles.includes(req.user.role);

    if (unauthorised) {
        const error = new Error('Unauthorised access');
        error.status = 403;
        next(error);
    }

    next();
}

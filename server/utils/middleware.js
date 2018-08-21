const logger = require('../../log.js');
const authorisationConfig = require('../routes/config/authorisation');
const {getWhereKeyLike, isEmpty} = require('../utils/functionalHelpers');
const {unauthorisedError} = require('../utils/errors');

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
    return async (req, res, next, bookingId) => {
        try {

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

function authorisationMiddleware(req, res, next) {
    const config = getWhereKeyLike(req.originalUrl, authorisationConfig);
    if (isEmpty(config)) {
        return next();
    }

    const authorisedRole = config.authorised.find(authorisedRole => req.user.role === authorisedRole.role);
    if (!authorisedRole) {
        return next(unauthorisedError());
    }

    const authorisedForStage = isEmpty(authorisedRole.stage) || authorisedRole.stage.includes(res.locals.licence.stage);
    if (!authorisedForStage) {
        return next(unauthorisedError());
    }

    next();
}

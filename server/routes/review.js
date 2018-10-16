const express = require('express');
const logger = require('../../log');
const {async, checkLicenceMiddleWare, authorisationMiddleware} = require('../utils/middleware');
const {getIn, lastItem} = require('../utils/functionalHelpers');

module.exports = function(
    {licenceService, conditionsService, prisonerService, authenticationMiddleware, audit}) {

    const router = express.Router();
    router.use(authenticationMiddleware());
    router.param('bookingId', checkLicenceMiddleWare(licenceService, prisonerService));
    router.param('bookingId', authorisationMiddleware);

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    router.get('/review/:sectionName/:bookingId', async(async (req, res) => {
        const {sectionName, bookingId} = req.params;
        logger.debug(`GET /review/${sectionName}/${bookingId}`);

        const licence = getIn(res.locals.licence, ['licence']) || {};
        const stage = getIn(res.locals.licence, ['stage']) || {};
        const licenceVersion = getIn(res.locals.licence, ['version']) || {};

        const licenceWithAddress = addAddressTo(licence);
        const errorObject = licenceService.getValidationErrorsForReview({
            licenceStatus: res.locals.licenceStatus,
            licence: licenceWithAddress
        });
        const data = await conditionsService.populateLicenceWithConditions(licenceWithAddress, errorObject);

        const prisonerInfo = await prisonerService.getPrisonerDetails(bookingId, req.user.token);

        res.render(`review/${sectionName}`, {
            bookingId,
            data,
            prisonerInfo,
            stage,
            licenceVersion,
            errorObject
        });
    }));

    return router;
};

function addAddressTo(licence) {
    const allAddresses = getIn(licence, ['proposedAddress', 'curfewAddress', 'addresses']);

    if (!allAddresses) {
        return licence;
    }

    const address = lastItem(allAddresses);
    return {
        ...licence,
        proposedAddress: {
            ...licence.proposedAddress,
            curfewAddress: address
        }
    };
}

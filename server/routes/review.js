const logger = require('../../log');
const {asyncMiddleware} = require('../utils/middleware');
const {getIn, lastItem} = require('../utils/functionalHelpers');

module.exports = ({licenceService, conditionsService, prisonerService}) => router => {

    router.get('/review/:sectionName/:bookingId', asyncMiddleware(async (req, res) => {
        const {sectionName, bookingId} = req.params;
        logger.debug(`GET /review/${sectionName}/${bookingId}`);

        const licence = getIn(res.locals.licence, ['licence']) || {};
        const stage = getIn(res.locals.licence, ['stage']) || {};
        const licenceVersion = getIn(res.locals.licence, ['version']) || {};

        const licenceWithAddress = addAddressTo(licence);

        const showErrors = stagesForRole[req.user.role].includes(stage);
        const errorObject = showErrors ? getErrors(res.locals.licenceStatus, licenceWithAddress, licence, stage) : {};

        const data = await conditionsService.populateLicenceWithConditions(licenceWithAddress, errorObject);

        const prisonerInfo = await prisonerService.getPrisonerDetails(bookingId, res.locals.token);

        res.render(`review/${sectionName}`, {
            bookingId,
            data,
            prisonerInfo,
            stage,
            licenceVersion,
            errorObject,
            showErrors
        });
    }));

    function getErrors(licenceStatus, licenceWithAddress, licence, stage) {
        if (stage === 'ELIGIBILITY') {
            return licenceService.validateFormGroup({licence, stage});
        }

        return licenceService.getValidationErrorsForReview({licenceWithAddress, licence});
    }

    return router;
};

const stagesForRole = {
    CA: ['ELIGIBILITY', 'PROCESSING_CA', 'FINAL_CHECKS'],
    RO: ['PROCESSING_RO'],
    DM: ['APPROVAL']
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

const {getLicenceStatus} = require('../../utils/licenceStatus');
const {getIn, lastItem} = require('../../utils/functionalHelpers');

module.exports = ({conditionsService, licenceService, prisonerService, logger}) => {

    async function getReviewSection(req, res) {
        const {sectionName, bookingId} = req.params;
        logger.debug(`GET /review/${sectionName}/${bookingId}`);

        const licence = getIn(res.locals.licence, ['licence']) || {};
        const stage = getIn(res.locals.licence, ['stage']) || {};
        const licenceVersion = getIn(res.locals.licence, ['version']) || {};
        const licenceStatus = getLicenceStatus(res.locals.licence);

        const licenceWithAddress = addAddressTo(licence);
        const errorObject = licenceService.getValidationErrorsForReview({licenceStatus, licence: licenceWithAddress});
        const data = await conditionsService.populateLicenceWithConditions(licenceWithAddress, errorObject);

        const prisonerInfo = await prisonerService.getPrisonerDetails(bookingId, req.user.token);

        res.render(`review/${sectionName}`, {
            bookingId,
            data,
            prisonerInfo,
            stage,
            licenceVersion,
            licenceStatus,
            errorObject
        });
    }

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

    return {
        getReviewSection
    };
};

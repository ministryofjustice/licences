const logger = require('../../log');
const {asyncMiddleware} = require('../utils/middleware');
const {getIn} = require('../utils/functionalHelpers');

module.exports = ({licenceService, conditionsService, prisonerService}) => router => {

    router.get('/review/:sectionName/:bookingId', asyncMiddleware(async (req, res) => {
        const {sectionName, bookingId} = req.params;
        const {licenceStatus} = res.locals;
        logger.debug(`GET /review/${sectionName}/${bookingId}`);

        const licence = getIn(res.locals.licence, ['licence']) || {};
        const stage = getIn(res.locals.licence, ['stage']) || {};
        const licenceVersion = getIn(res.locals.licence, ['version']) || {};

        const showErrors = stagesForRole[req.user.role].includes(stage);
        const errorObject = showErrors ? getErrors(licenceStatus, licence, licence, stage, licenceStatus) : {};

        const data = await conditionsService.populateLicenceWithConditions(licence, errorObject);

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

    function getErrors(licenceStatus, licenceWithAddress, licence, stage, {decisions}) {
        return licenceService.validateFormGroup({licence, stage, decisions});
    }

    return router;
};

const stagesForRole = {
    CA: ['ELIGIBILITY', 'PROCESSING_CA', 'FINAL_CHECKS'],
    RO: ['PROCESSING_RO'],
    DM: ['APPROVAL']
};

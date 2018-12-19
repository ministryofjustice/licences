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

        const postApproval = ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL'].includes(stage);
        const showErrors = shouldValidate(req.user.role, stage, postApproval);

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
            showErrors,
            postApproval
        });
    }));

    function getErrors(licenceStatus, licenceWithAddress, licence, stage, {decisions, tasks}) {
        return licenceService.validateFormGroup({licence, stage, decisions, tasks});
    }

    return router;
};

function shouldValidate(role, stage, postApproval) {
    return postApproval ? role === 'CA' : stagesForRole[role].includes(stage);
}

const stagesForRole = {
    CA: ['ELIGIBILITY', 'PROCESSING_CA', 'FINAL_CHECKS'],
    RO: ['PROCESSING_RO'],
    DM: ['APPROVAL']
};

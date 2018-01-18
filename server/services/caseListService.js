const logger = require('../../log.js');
const {isEmpty, getIn} = require('../utils/functionalHelpers');
const {formatObjectForView} = require('./utils/formatForView');

module.exports = function createCaseListService(nomisClientBuilder, licenceClient) {
    async function getHdcCaseList(user) {
        try {
            const nomisClient = nomisClientBuilder(user.token);
            const hdcEligibleReleases = await nomisClient.getHdcEligiblePrisoners();

            if (isEmpty(hdcEligibleReleases)) {
                logger.info('No hdc eligible prisoners');
                return [];
            }

            const licences = await licenceClient.getLicences(getOffenderIds(hdcEligibleReleases));
            return hdcEligibleReleases.map(decoratePrisonerDetails(licences));

        } catch (error) {
            logger.error('Error during getHdcEligiblePrisoners: ', error.message);
            throw error;
        }
    }

    return {getHdcCaseList};
};

function decoratePrisonerDetails(licences) {
     return prisoner => {
        const formattedPrisoner = formatObjectForView(prisoner);
        return {...formattedPrisoner, status: getStatus(prisoner, licences)};
    };
}

function getOffenderIds(releases) {
    return releases.map(offender => offender.offenderNo);
}

function getStatus(prisoner, licences) {
    const licenceForPrisoner = licences.find(rawLicence => {
        const licenceObject = getIn(rawLicence, ['licence']);
        return prisoner.offenderNo === licenceObject.nomisId;
    });

    return licenceForPrisoner ? 'Started' : 'Not started';
}

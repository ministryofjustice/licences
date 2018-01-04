const logger = require('../../log.js');
const {isEmpty} = require('../utils/functionalHelpers');
const {formatObjectForView} = require('./utils/formatForView');

module.exports = function createCaseListService(nomisClientBuilder) {
    async function getHdcCaseList(user) {
        try {
            const nomisClient = nomisClientBuilder(user.token);
            const hdcEligibleReleases = await nomisClient.getHdcEligiblePrisoners();

            if (isEmpty(hdcEligibleReleases)) {
                logger.info('No hdc eligible prisoners');
                return [];
            }

            return hdcEligibleReleases.map(formatPrisonerDetails);

        } catch (error) {
            logger.error('Error during getHdcEligiblePrisoners: ', error.message);
            throw error;
        }
    }

    return {getHdcCaseList};
};


function formatPrisonerDetails(prisoner) {
    const formattingOptions = {
        dates: ['hdced', 'crd'],
        capitalise: ['firstName', 'lastName']
    };
    const formattedPrisoner = formatObjectForView(prisoner, formattingOptions);
    return {...formattedPrisoner, status: 'Not started'};
}

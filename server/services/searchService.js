const {isEmpty, getUniqueStrings} = require('../utils/functionalHelpers');

module.exports = function createSearchService(logger, nomisClientBuilder, caseListFormatter) {

    async function searchOffenders(nomisIds, username, role) {

        logger.info(`searching for ${JSON.stringify(nomisIds)}`);

        try {
            const nomisClient = nomisClientBuilder(username);
            const uniqueNomisIds = getUniqueStrings([nomisIds]);

            if (isEmpty(uniqueNomisIds)) {
                logger.info('Empty search input');
                return [];
            }

            const hdcEligibleReleases = await nomisClient.getOffenderSentences(uniqueNomisIds);

            if (isEmpty(hdcEligibleReleases)) {
                logger.info('No hdc eligible prisoners found in search');
                return [];
            }

            const hdcEligibleReleasesWithCom = await Promise.all(hdcEligibleReleases.map(async offender => {
                const com = await nomisClient.getComRelation(offender.bookingId);
                return {...offender, com};
            }));

            return caseListFormatter.formatCaseList(hdcEligibleReleasesWithCom, role);

        } catch (error) {
            logger.error('Error during searchOffenders: ', error.stack);
            throw error;
        }
    }

    return {searchOffenders};
};

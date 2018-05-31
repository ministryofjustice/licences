const {getPrisonersQuery} = require('./utils/nomisSearchQueries');
const {isEmpty, arrayEquals, merge} = require('../utils/functionalHelpers');

module.exports = function createSearchService(logger, nomisClientBuilder, caseListFormatter) {

    async function searchOffendersAny({searchTerms, tokenId, user}) {
        const searchTermsAny = merge(searchTerms, {anyMatch: true});
        return searchOffenders({searchTerms: searchTermsAny, tokenId, user});
    }

    async function searchOffendersAll({searchTerms, tokenId, user}) {
        return searchOffenders({searchTerms, tokenId, user});
    }

    async function searchOffenders({searchTerms, tokenId, user}) {

        logger.info(`searching for '${JSON.stringify(searchTerms)}'`);

        try {
            const nomisClient = nomisClientBuilder(tokenId);

            const nomisIds = await nomisIdsFor(searchTerms, nomisClient);

            if (isEmpty(nomisIds)) {
                logger.info('No hdc eligible prisoners found in search');
                return [];
            }

            const hdcEligibleReleases = await nomisClient.getHdcEligiblePrisoners(nomisIds);

            if (isEmpty(hdcEligibleReleases)) {
                logger.info('No hdc eligible prisoners found in search');
                return [];
            }

            const hdcEligibleReleasesWithCom = await Promise.all(hdcEligibleReleases.map(async offender => {
                const com = await nomisClient.getComRelation(offender.bookingId);
                return {...offender, com};
            }));

            return caseListFormatter.formatCaseList(user.role, hdcEligibleReleasesWithCom);

        } catch (error) {
            logger.error('Error during searchOffenders: ', error.stack);
            throw error;
        }
    }

    return {searchOffendersAny, searchOffendersAll};
};

async function nomisIdsFor(searchTerms, nomisClient) {
    const searchResultNomisIds = await getPrisonNumbers(searchTerms, nomisClient) || [];

    return Array.from(new Set(searchResultNomisIds)).filter(id => id);
}

async function getPrisonNumbers(searchTerms, nomisClient) {

    if(arrayEquals(Object.keys(searchTerms).filter(it => it !=='anyMatch'), ['nomisId'])) {
        return searchTerms.nomisId;
    }

    const query = getPrisonersQuery(searchTerms);
    const offenders = await nomisClient.getPrisoners(query);

    return getOffenderIds(offenders);
}

function getOffenderIds(offenders) {
    return offenders.map(offender => offender.offenderNo);
}

const logger = require('../../log.js');
const {isEmpty, getIn} = require('../utils/functionalHelpers');

module.exports = function createCaseListService(nomisClientBuilder, licenceClient, caseListFormatter) {

    async function getHdcCaseList(username, role) {
        try {
            const nomisClient = nomisClientBuilder(username);
            const hdcEligibleReleases = await getCaseList(nomisClient, licenceClient, username, role);

            if (isEmpty(hdcEligibleReleases)) {
                logger.info('No hdc eligible prisoners');
                return [];
            }

            return caseListFormatter.formatCaseList(hdcEligibleReleases, role);

        } catch (error) {
            logger.error('Error during getHdcCaseList: ', error.stack);
            throw error;
        }
    }

    return {getHdcCaseList};
};

async function getCaseList(nomisClient, licenceClient, username, role) {
    const asyncCaseRetrievalMethod = {
        CA: nomisClient.getHdcEligiblePrisoners,
        RO: getROCaseList(nomisClient, licenceClient, username),
        DM: nomisClient.getHdcEligiblePrisoners
    };

    return asyncCaseRetrievalMethod[role]();
}

function getROCaseList(nomisClient, licenceClient, username) {
    return async () => {
        const deliusUserName = await licenceClient.getDeliusUserName(username);

        if (!deliusUserName) {
            logger.warn(`No delius user ID for nomis ID '${username}'`);
            return [];
        }

        const requiredPrisoners = await nomisClient.getROPrisoners(deliusUserName);

        if (!isEmpty(requiredPrisoners)) {
            const requiredIDs = requiredPrisoners.map(prisoner => prisoner.offenderNo);
            const offenders = await nomisClient.getOffenderSentences(requiredIDs);
            return offenders
                .filter(prisoner => getIn(prisoner, ['sentenceDetail', 'homeDetentionCurfewEligibilityDate']));
        }

        return [];
    };
}

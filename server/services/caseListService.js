const logger = require('../../log.js');
const {isEmpty} = require('../utils/functionalHelpers');

module.exports = function createCaseListService(nomisClientBuilder, licenceClient, caseListFormatter) {

    async function getHdcCaseList(user) {
        try {
            const nomisClient = nomisClientBuilder(user.username);
            const hdcEligibleReleases = await getCaseList(nomisClient, licenceClient, user);

            if (isEmpty(hdcEligibleReleases)) {
                logger.info('No hdc eligible prisoners');
                return [];
            }

            return caseListFormatter.formatCaseList(user.role, hdcEligibleReleases);

        } catch (error) {
            logger.error('Error during getHdcCaseList: ', error.stack);
            throw error;
        }
    }

    return {getHdcCaseList};
};

async function getCaseList(nomisClient, licenceClient, user) {
    const asyncCaseRetrievalMethod = {
        CA: nomisClient.getHdcEligiblePrisoners,
        RO: getROCaseList(nomisClient, licenceClient, user),
        DM: nomisClient.getHdcEligiblePrisoners
    };

    return asyncCaseRetrievalMethod[user.role]();
}

function getROCaseList(nomisClient, licenceClient, user) {
    return async () => {
        const deliusUserName = await licenceClient.getDeliusUserName(user.username);

        if (!deliusUserName) {
            logger.warn(`No delius user ID for nomis ID '${user.username}'`);
            return [];
        }

        const requiredPrisoners = await nomisClient.getROPrisoners(deliusUserName);

        if (!isEmpty(requiredPrisoners)) {
            const requiredIDs = requiredPrisoners.map(prisoner => prisoner.offenderNo);
            return nomisClient.getHdcEligiblePrisoners(requiredIDs);
        }

        return [];
    };
}

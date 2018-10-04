const logger = require('../../log.js');
const {isEmpty, getIn} = require('../utils/functionalHelpers');

module.exports = function createCaseListService(nomisClientBuilder, licenceClient, caseListFormatter) {
    async function getHdcCaseList(token, username, role) {
        try {
            const nomisClient = nomisClientBuilder(token);
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
        const upperCaseUserName = username.toUpperCase();
        const deliusUserName = await licenceClient.getDeliusUserName(upperCaseUserName);

        if (!deliusUserName) {
            logger.warn(`No delius user ID for nomis ID '${upperCaseUserName}'`);
            return [];
        }

        const requiredPrisoners = await nomisClient.getROPrisoners(deliusUserName);

        if (!isEmpty(requiredPrisoners)) {
            const requiredIDs = requiredPrisoners.map(prisoner => prisoner.bookingId);
            const offenders = await nomisClient.getOffenderSentencesByBookingId(requiredIDs);
            return offenders
                .filter(prisoner => getIn(prisoner, ['sentenceDetail', 'homeDetentionCurfewEligibilityDate']));
        }

        return [];
    };
}

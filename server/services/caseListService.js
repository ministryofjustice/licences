const logger = require('../../log.js');
const {isEmpty, getIn, firstItem} = require('../utils/functionalHelpers');
const caseListTabs = require('../routes/config/caseListTabs');

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

    function addTabToCases(userRole, caseList) {
        return caseList.map(addTabToCase.bind(undefined, userRole));
    }

    function addTabToCase(role, offender) {
        const tabsConfigForRole = getIn(caseListTabs, [role]);

        const correctTab = offender ? tabsConfigForRole.find(correctTabFor(offender)) : firstItem(tabsConfigForRole);

        return {
            ...offender,
            tab: correctTab ? correctTab.id : null
        };
    }

    return {getHdcCaseList, addTabToCase, addTabToCases};
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
            const requiredIDs = requiredPrisoners.map(prisoner => prisoner.bookingId);
            const offenders = await nomisClient.getOffenderSentencesByBookingId(requiredIDs);
            return offenders
                .filter(prisoner => getIn(prisoner, ['sentenceDetail', 'homeDetentionCurfewEligibilityDate']));
        }

        return [];
    };
}

function correctTabFor(offender) {
   return tab => {
       const correctStage = tab.licenceStages.includes(offender.stage);
       const correctStatus = tab.licenceStatus ? tab.licenceStatus.includes(offender.status) : true;

       const statusFilter = getIn(tab, ['statusFilter', offender.stage]);
       const filterStatus = statusFilter && statusFilter.includes(offender.status);

       return correctStage && correctStatus && !filterStatus;
   };
}

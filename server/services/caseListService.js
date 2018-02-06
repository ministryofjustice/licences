const logger = require('../../log.js');
const {isEmpty, getIn} = require('../utils/functionalHelpers');
const {formatObjectForView} = require('./utils/formatForView');

module.exports = function createCaseListService(nomisClientBuilder, licenceClient) {
    async function getHdcCaseList(user) {
        try {
            const nomisClient = nomisClientBuilder(user.token);
            const hdcEligibleReleases = await getCaseList(nomisClient, licenceClient, user);

            if (isEmpty(hdcEligibleReleases)) {
                logger.info('No hdc eligible prisoners');
                return [];
            }

            const licences = await licenceClient.getLicences(getOffenderIds(hdcEligibleReleases));
            return hdcEligibleReleases.map(decoratePrisonerDetails(licences));

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

    return asyncCaseRetrievalMethod[user.roleCode]();
}

function getROCaseList(nomisClient, licenceClient, user) {
    return async () => {
        const deliusUserName = await licenceClient.getDeliusUserName(user.username);

        const requiredPrisoners = await nomisClient.getROPrisoners(deliusUserName[0].STAFF_ID.value);

        if(requiredPrisoners && requiredPrisoners.length > 0) {
            const requiredIDs = requiredPrisoners.map(prisoner => prisoner.offenderNo);
            return nomisClient.getHdcEligiblePrisoners(requiredIDs);
        }

        return [];
    };
}

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

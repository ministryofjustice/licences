const logger = require('../../log.js');
const {isEmpty, getIn} = require('../utils/functionalHelpers');
const {formatObjectForView} = require('./utils/formatForView');
const {getLicenceStatus} = require('../utils/licenceStatus');
const {getStatusLabel} = require('../utils/licenceStatusLabels');
const {licenceStages} = require('../models/licenceStages');
const moment = require('moment');

module.exports = function createCaseListService(nomisClientBuilder, licenceClient) {
    async function getHdcCaseList(user) {
        try {
            const nomisClient = nomisClientBuilder(user.username);
            const hdcEligibleReleases = await getCaseList(nomisClient, licenceClient, user);

            if (isEmpty(hdcEligibleReleases)) {
                logger.info('No hdc eligible prisoners');
                return [];
            }

            const licences = await licenceClient.getLicences(getOffenderIds(hdcEligibleReleases));
            return hdcEligibleReleases
                .filter(prisoner => getIn(prisoner, ['sentenceDetail', 'homeDetentionCurfewEligibilityDate']))
                .map(decoratePrisonerDetails(licences, user.role))
                .sort(compareReleaseDates);

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

function decoratePrisonerDetails(licences, role) {
    return prisoner => {
        const formattedPrisoner = formatObjectForView(prisoner);
        const {stage, status} = getStatus(prisoner, licences, role);
        return {...formattedPrisoner, stage, status};
    };
}

function getOffenderIds(releases) {
    return releases.map(offender => offender.offenderNo);
}

function getStatus(prisoner, licences, role) {

    const licenceForPrisoner = licences.find(rawLicence => {
        return prisoner.offenderNo === rawLicence.nomis_id;
    });

    if (!licenceForPrisoner) {
        return {stage: licenceStages.UNSTARTED, status: 'Not started'};
    }

    const licenceStatus = getLicenceStatus(licenceForPrisoner);
    return {stage: licenceForPrisoner.stage, status: getStatusLabel(licenceStatus, role)};
}

function compareReleaseDates(address1, address2) {
    const hdced1 = getIn(address1, ['sentenceDetail', 'homeDetentionCurfewEligibilityDate']);
    const hdced2 = getIn(address2, ['sentenceDetail', 'homeDetentionCurfewEligibilityDate']);

    if(hdced1 !== hdced2) {
        return dateDifference(hdced1, hdced2);
    }

    const rd1 = getIn(address1, ['sentenceDetail', 'releaseDate']);
    const rd2 = getIn(address2, ['sentenceDetail', 'releaseDate']);

    return dateDifference(rd1, rd2);
}

function dateDifference(address1, address2) {
    return moment(address1, 'DD-MM-YYYY').diff(moment(address2, 'DD-MM-YYYY'));
}

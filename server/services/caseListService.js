const logger = require('../../log.js');
const {isEmpty, ascend, sortWith, merge} = require('../utils/functionalHelpers');
const {formatObjectForView} = require('./utils/formatForView');
const {getLicenceStatus} = require('../utils/licenceStatus');
const {getStatusLabel} = require('../utils/licenceStatusLabels');
const {licenceStages} = require('../models/licenceStages');

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
            return hdcEligibleReleases.map(decoratePrisonerDetails(licences, user.role));

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

    const caseList = await asyncCaseRetrievalMethod[user.role]();

    if (!caseList) {
        return null;
    }

    return sortCaseList(caseList.map(addReleaseDate));
}

function getROCaseList(nomisClient, licenceClient, user) {
    return async () => {
        const deliusUserName = await licenceClient.getDeliusUserName(user.username);

        if (!deliusUserName[0]) {
            logger.warn(`No delius user ID for nomis ID '${user.username}'`);
            return [];
        }

        const requiredPrisoners = await nomisClient.getROPrisoners(deliusUserName[0].STAFF_ID.value);

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
        return prisoner.offenderNo === rawLicence.nomisId;
    });

    if (!licenceForPrisoner) {
        return {stage: licenceStages.UNSTARTED, status: 'Not started'};
    }

    const licenceStatus = getLicenceStatus(licenceForPrisoner);
    return {stage: licenceForPrisoner.stage, status: getStatusLabel(licenceStatus, role)};
}

function addReleaseDate(address) {

    const {conditionalReleaseDate, automaticReleaseDate} = address.sentenceDetail;

    const crd = conditionalReleaseDate && conditionalReleaseDate !== 'Invalid date' ? conditionalReleaseDate : null;
    const ard = automaticReleaseDate && automaticReleaseDate !== 'Invalid date' ? automaticReleaseDate : null;

    return {
        ...address,
        sentenceDetail: merge(address.sentenceDetail, {releaseDate: crd || ard})
    };
}

const sortCaseList = sortWith([
    ascend(['sentenceDetail', 'homeDetentionCurfewEligibilityDate']),
    ascend(['sentenceDetail', 'releaseDate'])
]);

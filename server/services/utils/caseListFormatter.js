const {getIn} = require('../../utils/functionalHelpers');
const {formatObjectForView} = require('./formatForView');
const {getLicenceStatus} = require('../../utils/licenceStatus');
const {getStatusLabel} = require('../../utils/licenceStatusLabels');
const {licenceStages} = require('../../models/licenceStages');
const moment = require('moment');

module.exports = function createCaseListFormatter(logger, licenceClient) {

    async function formatCaseList(userRole, hdcEligibleReleases) {

        const licences = await licenceClient.getLicences(getOffenderIds(hdcEligibleReleases));
        return hdcEligibleReleases
            .filter(prisoner => getIn(prisoner, ['sentenceDetail', 'homeDetentionCurfewEligibilityDate']))
            .map(decoratePrisonerDetails(licences, userRole))
            .sort(compareReleaseDates);
    }

    return {formatCaseList};
};

function getOffenderIds(releases) {
    return releases.map(offender => offender.offenderNo);
}

function decoratePrisonerDetails(licences, userRole) {
    return prisoner => {
        const formattedPrisoner = formatObjectForView(prisoner);
        const {stage, status} = getStatus(prisoner, licences, userRole);
        return {...formattedPrisoner, stage, status};
    };
}

function getStatus(prisoner, licences, userRole) {

    const licenceForPrisoner = licences.find(rawLicence => {
        return prisoner.offenderNo === rawLicence.nomis_id;
    });

    if (!licenceForPrisoner) {
        return {stage: licenceStages.UNSTARTED, status: 'Not started'};
    }

    const licenceStatus = getLicenceStatus(licenceForPrisoner);
    return {stage: licenceForPrisoner.stage, status: getStatusLabel(licenceStatus, userRole)};
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

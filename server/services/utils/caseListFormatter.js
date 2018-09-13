const {getIn} = require('../../utils/functionalHelpers');
const {formatObjectForView} = require('./formatForView');
const {getLicenceStatus} = require('../../utils/licenceStatus');
const {getStatusLabel} = require('../../utils/licenceStatusLabels');
const {licenceStages} = require('../../models/licenceStages');
const moment = require('moment');

module.exports = function createCaseListFormatter(logger, licenceClient) {

    async function formatCaseList(hdcEligibleReleases, role) {

        const licences = await licenceClient.getLicences(getBookingIds(hdcEligibleReleases));

        return hdcEligibleReleases
            .filter(prisoner => getIn(prisoner, ['sentenceDetail', 'homeDetentionCurfewEligibilityDate']))
            .map(decoratePrisonerDetails(licences, role))
            .sort(compareReleaseDates);
    }

    return {formatCaseList};
};

function getBookingIds(releases) {
    return releases.map(offender => offender.bookingId);
}

function decoratePrisonerDetails(licences, role) {
    return prisoner => {
        const formattedPrisoner = formatObjectForView(prisoner);
        const decoratedPrisoner = addRoleSpecificDecoration(formattedPrisoner, role);
        const {stage, status} = getStatus(prisoner, licences, role);
        return {...decoratedPrisoner, stage, status};
    };
}

function getStatus(prisoner, licences, role) {

    const licenceForPrisoner = licences.find(rawLicence => {
        return prisoner.bookingId === rawLicence.booking_id;
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

    if (hdced1 !== hdced2) {
        return dateDifference(hdced1, hdced2);
    }

    const rd1 = getIn(address1, ['sentenceDetail', 'releaseDate']);
    const rd2 = getIn(address2, ['sentenceDetail', 'releaseDate']);

    return dateDifference(rd1, rd2);
}

function dateDifference(address1, address2) {
    return moment(address1, 'DD-MM-YYYY').diff(moment(address2, 'DD-MM-YYYY'));
}

function addRoleSpecificDecoration(prisoner, role) {
    if (role === 'CA') {
        return addHDCEDCountdown(prisoner);
    }
    return prisoner;
}

function addHDCEDCountdown(prisoner) {
    const dueDate = moment(prisoner.sentenceDetail.homeDetentionCurfewEligibilityDate, 'DD/MM/YYYY');
    const now = moment();

    return {...prisoner, due: getDueText(dueDate, now)};
}

function getDueText(dueDate, now) {
    const years = dueDate.diff(now, 'years');
    const months = dueDate.diff(now, 'months');
    const weeks = dueDate.diff(now, 'weeks');
    const days = dueDate.diff(now, 'days');

    if (years >= 1) {
        const unit = years === 1 ? 'year' : 'years';
        return {text: `${years} ${unit}`};
    }

    if (months >= 3) {
        return {text: `${months} months`};
    }

    if (weeks >= 2) {
        return {text: `${weeks} weeks`};
    }

    if (Math.sign(days) === 1) {
        const unit = days === 1 ? 'day' : 'days';
        return {text: `${days} ${unit}`};
    }

    const unit = days === 1 ? 'day' : 'days';
    return {text: `${Math.abs(days)} ${unit}`, status: 'OVERDUE'};
}

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
    const hdced = getIn(prisoner, ['sentenceDetail', 'homeDetentionCurfewEligibilityDate']);
    if (!hdced) {
        return {...prisoner, due: {text: 'No HDCED'}};
    }

    const dueDate = moment(hdced, 'DD/MM/YYYY');

    return {...prisoner, due: getDueText(dueDate)};
}

function getDueText(dueDate) {

    const text = dueDate.fromNow();
    const sanitisedText = text === '0 days overdue' ? '0 days' : text;
    const overdue = sanitisedText.includes('overdue');

    return {text: sanitisedText, overdue};
}

moment.updateLocale('en', {
    relativeTime: {
        future: '%s',
        past: '%s overdue',
        s: '0 days',
        ss: '0 days',
        m: '0 days',
        mm: '0 days',
        h: '0 days',
        hh: '0 days',
        d: '%d day',
        dd: '%d days',
        M: '%d month',
        MM: '%d months',
        y: '%d year',
        yy: '%d years'
    }
});

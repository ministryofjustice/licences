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
            .sort(sortList(role));
    }

    return {formatCaseList};
};

function getBookingIds(releases) {
    return releases.map(offender => offender.bookingId);
}

function decoratePrisonerDetails(licences, role) {
    return prisoner => {
        const formattedPrisoner = formatObjectForView(prisoner);
        const decoratedPrisoner = addRoleSpecificDecoration(formattedPrisoner, role, licences);
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

function sortList(role) {
    if (role === 'RO') {
        return sortByDaysReceived;
    }
    return sortByReleaseDate;
}

function sortByReleaseDate(prisoner1, prisoner2) {
    const hdced1 = getIn(prisoner1, ['sentenceDetail', 'homeDetentionCurfewEligibilityDate']);
    const hdced2 = getIn(prisoner2, ['sentenceDetail', 'homeDetentionCurfewEligibilityDate']);

    if (hdced1 !== hdced2) {
        return dateDifference(hdced1, hdced2);
    }

    const rd1 = getIn(prisoner1, ['sentenceDetail', 'releaseDate']);
    const rd2 = getIn(prisoner2, ['sentenceDetail', 'releaseDate']);

    return dateDifference(rd1, rd2);
}

function sortByDaysReceived(prisoner1, prisoner2) {

    const prisoner1Received = getIn(prisoner1, ['received']);
    const prisoner2Received = getIn(prisoner2, ['received']);

    if (!prisoner1Received && !prisoner2Received) {
        return sortByReleaseDate(prisoner1, prisoner2);
    }

    if (!prisoner1Received && prisoner2Received) {
        return 1;
    }

    if (prisoner1Received && !prisoner2Received) {
        return -1;
    }

    return prisoner2Received.days - prisoner1Received.days;
}

function dateDifference(address1, address2) {
    return moment(address1, 'DD-MM-YYYY').diff(moment(address2, 'DD-MM-YYYY'));
}

function addRoleSpecificDecoration(prisoner, role, licences) {
    if (role === 'CA') {
        return addHDCEDCountdown(prisoner);
    }
    if (role === 'RO') {
        return addReceivedTime(prisoner, licences);
    }
    return prisoner;
}

function addHDCEDCountdown(prisoner) {
    const hdced = getIn(prisoner, ['sentenceDetail', 'homeDetentionCurfewEligibilityDate']);
    const dueDate = moment(hdced, 'DD/MM/YYYY');

    return {...prisoner, due: getDueText(dueDate)};
}

function getDueText(dueDate) {

    const text = dueDate.fromNow();
    const sanitisedText = text === '0 days overdue' ? '0 days' : text;
    const overdue = sanitisedText.includes('overdue');

    return {text: sanitisedText, overdue};
}

function addReceivedTime(prisoner, licences) {
    const licence = licences.find(licence => licence.booking_id === prisoner.bookingId);

    if (!licence || licence.stage !== 'PROCESSING_RO') {
        return prisoner;
    }

    const text = moment(licence.transition_date).toNow();
    const days = text.split(' ')[0];
    const sanitisedText = Number(days) === 0 ? 'Today' : `${text} ago`;

    return {...prisoner, received: {text: sanitisedText, days}};
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

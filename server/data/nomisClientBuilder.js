const logger = require('../../log');
const config = require('../config');
const {merge, pipe} = require('../utils/functionalHelpers');
const superagent = require('superagent');
const {NoTokenError} = require('../utils/errors');

const timeoutSpec = {
    response: config.nomis.timeout.response,
    deadline: config.nomis.timeout.deadline
};

const apiUrl = config.nomis.apiUrl;
const invalidDate = 'Invalid date';

module.exports = token => {

    const nomisGet = nomisGetBuilder(token);
    const nomisPost = nomisPostBuilder(token);

    const addReleaseDatesToPrisoner = pipe(
        addReleaseDate,
        addEffectiveConditionalReleaseDate,
        addEffectiveAutomaticReleaseDate
    );

    return {

        getBooking: function(bookingId) {
            const path = `${apiUrl}/bookings/${bookingId}`;
            return nomisGet({path});
        },

        getAliases: function(bookingId) {
            const path = `${apiUrl}/bookings/${bookingId}/aliases`;
            return nomisGet({path});
        },

        getIdentifiers: function(bookingId) {
            const path = `${apiUrl}/bookings/${bookingId}/identifiers`;
            return nomisGet({path});
        },

        getPersonIdentifiers: function(personId) {
            const path = `${apiUrl}/persons/${personId}/identifiers`;
            return nomisGet({path});
        },

        getMainOffence: function(bookingId) {
            const path = `${apiUrl}/bookings/${bookingId}/mainOffence`;
            return nomisGet({path});
        },

        getComRelation: function(bookingId) {
            const path = `${apiUrl}/bookings/${bookingId}/relationships`;
            const query = {relationshipType: 'RO'};
            return nomisGet({path, query});
        },

        getImageInfo: function(imageId) {
            const path = `${apiUrl}/images/${imageId}`;
            return nomisGet({path});
        },

        getHdcEligiblePrisoners: async function() {
            const path = `${apiUrl}/offender-sentences/home-detention-curfew-candidates`;
            const headers = {'Page-Limit': 10000};

            const prisoners = await nomisGet({path, headers});
            return prisoners.map(addReleaseDatesToPrisoner);
        },

        getOffenderSentencesByNomisId: async function(nomisIds) {
            const path = `${apiUrl}/offender-sentences`;
            const query = {offenderNo: nomisIds};
            const headers = {'Page-Limit': 10000};

            const prisoners = await nomisGet({path, query, headers});
            return prisoners.map(addReleaseDatesToPrisoner);
        },

        getOffenderSentencesByBookingId: async function(bookingIds) {
            const path = `${apiUrl}/offender-sentences/bookings`;
            const headers = {'Page-Limit': 10000};
            const body = [].concat(bookingIds);

            const prisoners = await nomisPost({path, body, headers});
            return prisoners.map(addReleaseDatesToPrisoner);
        },

        getImageData: function(id) {
            const path = `${apiUrl}/images/${id}/data`;
            return nomisGet({path, responseType: 'blob'});
        },

        getROPrisoners: function(deliusUserName) {
            const path = `${apiUrl}/offender-relationships/externalRef/${deliusUserName}/RO`;
            return nomisGet({path});
        },

        getEstablishment: function(agencyLocationId) {
            const path = `${apiUrl}/agencies/prison/${agencyLocationId}`;
            return nomisGet({path});
        },

        getUserInfo: function(userName) {
            const path = `${apiUrl}/users/${userName}`;
            return nomisGet({path});
        },

        getUserRoles: function() {
            const path = `${apiUrl}/users/me/roles`;
            return nomisGet({path});
        }
    };
};

function nomisGetBuilder(token) {

    return async ({path, query = '', headers = {}, responseType = ''} = {}) => {

        if (!token) {
            throw new NoTokenError();
        }

        try {
            const result = await superagent
                .get(path)
                .query(query)
                .set('Authorization', token)
                .set(headers)
                .responseType(responseType)
                .timeout(timeoutSpec);

            return result.body;

        } catch (error) {

            logger.warn('Error calling nomis');
            logger.warn(error);

            throw error;
        }
    };
}

function nomisPostBuilder(token) {

    return async ({path, body = '', headers = {}, responseType = ''} = {}) => {

        if (!token) {
            throw new NoTokenError();
        }

        try {
            const result = await superagent
                .post(path)
                .send(body)
                .set('Authorization', token)
                .set(headers)
                .responseType(responseType)
                .timeout(timeoutSpec);

            return result.body;

        } catch (error) {

            logger.warn('Error calling nomis');
            logger.warn(error);

            throw error;
        }
    };
}

function findFirstValid(datesList) {
    return datesList.find(date => date && date !== invalidDate) || null;
}

function addEffectiveConditionalReleaseDate(prisoner) {
    const {
        conditionalReleaseDate,
        conditionalReleaseOverrideDate
    } = prisoner.sentenceDetail;

    const crd = findFirstValid([conditionalReleaseOverrideDate, conditionalReleaseDate]);

    return {
        ...prisoner,
        sentenceDetail: merge(prisoner.sentenceDetail, {effectiveConditionalReleaseDate: crd})
    };
}

function addEffectiveAutomaticReleaseDate(prisoner) {
    const {
        automaticReleaseDate,
        automaticReleaseOverrideDate
    } = prisoner.sentenceDetail;

    const ard = findFirstValid([automaticReleaseOverrideDate, automaticReleaseDate]);

    return {
        ...prisoner,
        sentenceDetail: merge(prisoner.sentenceDetail, {effectiveAutomaticReleaseDate: ard})
    };
}

function addReleaseDate(prisoner) {
    const {
        automaticReleaseDate,
        automaticReleaseOverrideDate,
        conditionalReleaseDate,
        conditionalReleaseOverrideDate
    } = prisoner.sentenceDetail;

    const releaseDate = findFirstValid([
        conditionalReleaseOverrideDate,
        conditionalReleaseDate,
        automaticReleaseOverrideDate,
        automaticReleaseDate
    ]);

    return {
        ...prisoner,
        sentenceDetail: merge(prisoner.sentenceDetail, {releaseDate})
    };
}

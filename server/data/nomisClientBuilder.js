const config = require('../config');
const {merge, pipe} = require('../utils/functionalHelpers');
const superagent = require('superagent');
const generateApiGatewayToken = require('../authentication/apiGateway');
const {NoTokenError} = require('../utils/errors');

const timeoutSpec = {
    response: config.nomis.timeout.response,
    deadline: config.nomis.timeout.deadline
};

const apiUrl = config.nomis.apiUrl;
const invalidDate = 'Invalid date';

module.exports = (tokenStore, signInService) => username => {

    const nomisGet = nomisGetBuilder(tokenStore, signInService, username);
    const addReleaseDatesToPrisoner = pipe(
        addReleaseDate,
        addEffectiveConditionalReleaseDate,
        addEffectiveAutomaticReleaseDate
    );

    return {
        getUpcomingReleasesByOffenders: function(nomisIds) {
            const path = `${apiUrl}/offender-releases`;
            const query = {offenderNo: nomisIds}; // todo add cutoff date
            const headers = {'Page-Limit': nomisIds.length};
            return nomisGet({path, query, headers});
        },

        getBookings: function(nomisId) {
            const path = `${apiUrl}/bookings`;
            const query = {query: `offenderNo:eq:'${nomisId}'`};
            return nomisGet({path, query});
        },

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

        getMainOffence: function(bookingId) {
            const path = `${apiUrl}/bookings/${bookingId}/mainOffence`;
            return nomisGet({path});
        },

        getComRelation: function(bookingId) {
            const path = `${apiUrl}/bookings/${bookingId}/relationships`;
            const query = {query: `relationshipType:eq:'COM'`};
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

        getOffenderSentences: async function(nomisIds) {
            const path = `${apiUrl}/offender-sentences`;
            const query = {offenderNo: nomisIds};
            const headers = {'Page-Limit': 10000};

            const prisoners = await nomisGet({path, query, headers});
            return prisoners.map(addReleaseDatesToPrisoner);
        },

        getImageData: async function(id) {
            const path = `${apiUrl}/images/${id}/data`;
            return nomisGet({path, responseType: 'blob'});
        },

        getROPrisoners: async function(deliusUserName) {
            const path = `${apiUrl}/offender-relationships/externalRef/${deliusUserName}/COM`;
            return nomisGet({path});
        },

        getEstablishment: async function(agencyLocationId) {
            const path = `${apiUrl}/agencies/prison/${agencyLocationId}`;
            return nomisGet({path});
        },

        getPrisoners: async function(query) {
            const path = `${apiUrl}/prisoners`;
            return nomisGet({path, query});
        }
    };
};

function nomisGetBuilder(tokenStore, signInService, username) {

    return async ({path, query = '', headers = {}, responseType = ''} = {}) => {

        const tokens = tokenStore.get(username);

        if (!tokens) {
            throw new NoTokenError();
        }

        try {
            const result = await superagent
                .get(path)
                .query(query)
                .set('Authorization', gatewayTokenOrCopy(tokens.token))
                .set('Elite-Authorization', tokens.token)
                .set(headers)
                .responseType(responseType)
                .timeout(timeoutSpec);

            return result.body;

        } catch (error) {
            if (canRetry(error, tokens)) {
                return refreshAndRetry(username, {path, query, headers, responseType});
            }

            throw error;
        }
    };

    function canRetry(error, tokens) {
        const unauthorisedError = [400, 401, 403].includes(error.status);
        const refreshAllowed = Date.now() - tokens.timestamp >= 5000;

        return unauthorisedError && refreshAllowed;
    }

    async function refreshAndRetry(username, {path, query, headers, responseType}) {

        await signInService.refresh(username);

        const nomisGet = nomisGetBuilder(tokenStore, signInService, username);
        return nomisGet({path, query, headers, responseType});
    }
}

function effectiveConditionalReleaseDate({conditionalReleaseDate, conditionalReleaseOverrideDate}) {
    if (conditionalReleaseOverrideDate && conditionalReleaseOverrideDate !== invalidDate) {
        return conditionalReleaseOverrideDate;
    }

    if (conditionalReleaseDate && conditionalReleaseDate !== invalidDate) {
        return conditionalReleaseDate;
    }

    return null;
}

function effectiveAutomaticReleaseDate({automaticReleaseDate, automaticReleaseOverrideDate}) {
    if (automaticReleaseOverrideDate && automaticReleaseOverrideDate !== invalidDate) {
        return automaticReleaseOverrideDate;
    }

    if (automaticReleaseDate && automaticReleaseDate !== invalidDate) {
        return automaticReleaseDate;
    }

    return null;
}

function addEffectiveConditionalReleaseDate(prisoner) {
    const {
        conditionalReleaseDate,
        conditionalReleaseOverrideDate
    } = prisoner.sentenceDetail;

    const crd = effectiveConditionalReleaseDate({conditionalReleaseDate, conditionalReleaseOverrideDate});

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

    const ard = effectiveAutomaticReleaseDate({automaticReleaseDate, automaticReleaseOverrideDate});

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

    const crd = effectiveConditionalReleaseDate({conditionalReleaseDate, conditionalReleaseOverrideDate});
    const ard = effectiveAutomaticReleaseDate({automaticReleaseDate, automaticReleaseOverrideDate});

    return {
        ...prisoner,
        sentenceDetail: merge(prisoner.sentenceDetail, {releaseDate: crd || ard})
    };
}

function gatewayTokenOrCopy(token) {
    return config.nomis.apiGatewayEnabled === 'yes' ? generateApiGatewayToken() : token;
}

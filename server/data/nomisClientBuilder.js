const config = require('../config');
const logger = require('../../log.js');
const {merge} = require('../utils/functionalHelpers');
const superagent = require('superagent');
const generateApiGatewayToken = require('../authentication/apiGateway');
const {NoTokenError} = require('../utils/errors');

const timeoutSpec = {
    response: config.nomis.timeout.response,
    deadline: config.nomis.timeout.deadline
};

const apiUrl = config.nomis.apiUrl;

module.exports = (tokenStore, signInService) => tokenId => {

    const nomisGet = nomisGetBuilder(tokenStore, signInService, tokenId);

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

        getHdcEligiblePrisoners: async function(nomisIds) {
            const path = `${apiUrl}/offender-sentences`;
            const query = {
                    query: `homeDetentionCurfewEligibilityDate:is:not null,and:conditionalReleaseDate:is:not null`,
                    offenderNo: nomisIds
            };

            const headers = {
                'Page-Limit': 10000
            };

            const prisoners = await nomisGet({path, query, headers});
            return prisoners.map(prisoner => addReleaseDate(prisoner));
        },

        getHdcEligiblePrisoner: async function(nomisId) {
            const path = `${apiUrl}/offender-sentences`;
            const query = {offenderNo: nomisId};
            const prisoners = await nomisGet({path, query});
            return prisoners.map(prisoner => addReleaseDate(prisoner));
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
        }
    };
};

function nomisGetBuilder(tokenStore, signInService, tokenId) {

    const tokenObject = tokenStore.getTokens(tokenId);

    if(!tokenObject) {
        throw new NoTokenError();
    }

    return async ({path, query = '', headers = {}, responseType = ''} = {}) => {

        try {
            const result = await superagent
                .get(path)
                .query(query)
                .set('Authorization', gatewayTokenOrCopy(tokenObject.token))
                .set('Elite-Authorization', tokenObject.token)
                .set(headers)
                .responseType(responseType)
                .timeout(timeoutSpec);

            return result.body;

        } catch (error) {
            const unauthorisedError = error.status === 400 || error.status === 401 || error.status === 403;
            const refreshAttempted = Date.now() - tokenObject.timestamp < 5000;

            if(!unauthorisedError || refreshAttempted) {
                logger.error('Error from NOMIS: ', error.stack);
                throw error;
            }

            logger.info('Refreshing token for ', tokenId);
            await signInService.refresh(tokenId, tokenObject.refreshToken);

            const nomisGet = nomisGetBuilder(tokenStore, signInService, tokenId);
            return nomisGet({path, query, headers, responseType});
        }
    };
}

function addReleaseDate(prisoner) {

    const {conditionalReleaseDate, automaticReleaseDate} = prisoner.sentenceDetail;

    const crd = conditionalReleaseDate && conditionalReleaseDate !== 'Invalid date' ? conditionalReleaseDate : null;
    const ard = automaticReleaseDate && automaticReleaseDate !== 'Invalid date' ? automaticReleaseDate : null;

    return {
        ...prisoner,
        sentenceDetail: merge(prisoner.sentenceDetail, {releaseDate: crd || ard})
    };
}

function gatewayTokenOrCopy(token) {
    return config.nomis.apiGatewayEnabled === 'yes' ? generateApiGatewayToken() : token;
}

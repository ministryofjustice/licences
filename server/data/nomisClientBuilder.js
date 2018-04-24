const config = require('../config');
const logger = require('../../log.js');

const superagent = require('superagent');

const generateApiGatewayToken = require('../authentication/apiGateway');

const timeoutSpec = {
    response: config.nomis.timeout.response,
    deadline: config.nomis.timeout.deadline
};

const apiUrl = config.nomis.apiUrl;

module.exports = function(token) {
    return {
        getUpcomingReleasesByOffenders: function(nomisIds) {
            const path = `${apiUrl}/offender-releases`;
            const query = {offenderNo: nomisIds}; // todo add cutoff date
            const headers = {'Page-Limit': nomisIds.length};
            return nomisGet(path, query, token, headers);
        },

        getBookings: function(nomisId) {
            const path = `${apiUrl}/bookings`;
            const query = {query: `offenderNo:eq:'${nomisId}'`};
            return nomisGet(path, query, token);
        },

        getBooking: function(bookingId) {
            const path = `${apiUrl}/bookings/${bookingId}`;
            return nomisGet(path, '', token);
        },

        getSentenceDetail: function(bookingId) {
            const path = `${apiUrl}/bookings/${bookingId}/sentenceDetail`;
            return nomisGet(path, '', token);
        },

        getAliases: function(bookingId) {
            const path = `${apiUrl}/bookings/${bookingId}/aliases`;
            return nomisGet(path, '', token);
        },

        getMainOffence: function(bookingId) {
            const path = `${apiUrl}/bookings/${bookingId}/mainOffence`;
            return nomisGet(path, '', token);
        },

        getComRelation: function(bookingId) {
            const path = `${apiUrl}/bookings/${bookingId}/relationships`;
            const query = {query: `relationshipType:eq:'COM'`};
            return nomisGet(path, query, token);
        },

        getImageInfo: function(imageId) {
            const path = `${apiUrl}/images/${imageId}`;
            return nomisGet(path, '', token);
        },

        getDischargeAddress: function(nomisId) {
            const path = `${apiUrl}/dischargeAddress`;
            const query = {nomisId: `${nomisId}`};
            return nomisGet(path, query, token);
        },

        getHdcEligiblePrisoners: function(nomisIds) {
            const path = `${apiUrl}/offender-sentences`;
            const query = {
                    query: `homeDetentionCurfewEligibilityDate:is:not null,and:conditionalReleaseDate:is:not null`,
                    offenderNo: nomisIds
            };

            const headers = {
                'Page-Limit': 10000
            };

            return nomisGet(path, query, token, headers);
        },

        getHdcEligiblePrisoner: function(nomisId) {
            const path = `${apiUrl}/offender-sentences`;
            const query = {offenderNo: nomisId};
            return nomisGet(path, query, token);
        },

        getImageData: async function(id) {
            const path = `${apiUrl}/images/${id}/data`;
            return nomisGet(path, '', token, {}, 'blob');
        },

        getROPrisoners: async function(deliusUserName) {
            const path = `${apiUrl}/offender-relationships/externalRef/${deliusUserName}/COM`;
            return nomisGet(path, '', token);
        },

        getEstablishment: async function(agencyLocationId) {
            const path = `${apiUrl}/agencies/prison/${agencyLocationId}`;
            return nomisGet(path, '', token);
        }
    };
};

async function nomisGet(path, query, token, headers = {}, responseType = '') {

    try {
        const result = await superagent
            .get(path)
            .query(query)
            .set('Authorization', config.nomis.apiGatewayEnabled === 'yes' ? generateApiGatewayToken() : token)
            .set('Elite-Authorization', token)
            .set(headers)
            .responseType(responseType)
            .timeout(timeoutSpec);

        return result.body;

    } catch (error) {
        logger.error('Error from NOMIS: ', error.stack);
        throw error;
    }
}

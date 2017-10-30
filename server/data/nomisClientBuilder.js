const config = require('../config');
const logger = require('../../log.js');

const superagent = require('superagent');
const url = require('url');

const generateApiGatewayToken = require('../authentication/apiGateway');

const timeoutSpec = {
    response: config.nomis.timeout.response,
    deadline: config.nomis.timeout.deadline
};

const apiUrl = config.nomis.apiUrl;
const apiRoot = config.nomis.apiRoot;

module.exports = function(token) {
    return {
        getUpcomingReleasesFor: function(nomisIds) {
            const path = url.resolve(`${apiUrl}`, `${apiRoot}/offender-releases`);
            const query = {offenderNo: nomisIds};
            const headers = {'Page-Count': nomisIds.length};
            return nomisGet(path, query, token, headers);
        },

        getBookings: function(nomisId) {
            const path = url.resolve(`${apiUrl}`, `${apiRoot}/bookings`);
            const query = {query: `offenderNo:eq:'${nomisId}'`};
            return nomisGet(path, query, token);
        },

        getBooking: function(bookingId) {
            const path = url.resolve(`${apiUrl}`, `${apiRoot}/bookings/${bookingId}`);
            return nomisGet(path, '', token);
        },

        getSentenceDetail: function(bookingId) {
            const path = url.resolve(`${apiUrl}`, `${apiRoot}/bookings/${bookingId}/sentenceDetail`);
            return nomisGet(path, '', token);
        },

        getImageInfo: function(imageId) {
            const path = url.resolve(`${apiUrl}`, `${apiRoot}/images/${imageId}`);
            return nomisGet(path, '', token);
        },

        getDischargeAddress: function(nomisId) {
            const path = url.resolve(`${apiUrl}`, `${apiRoot}/dischargeAddress`);
            const query = {nomisId: `${nomisId}`};
            return nomisGet(path, query, token);
        }
    };
};

async function nomisGet(path, query, token, headers = {}) {

    try {
        const gwToken = process.env.NODE_ENV === 'test' ? 'dummy' : `Bearer ${generateApiGatewayToken()}`;

        const result = await superagent
            .get(path)
            .query(query)
            .set('Accept', 'application/json')
            .set('Authorization', gwToken)
            .set('Elite-Authorization', token)
            .set(headers)
            .timeout(timeoutSpec);

        return result.body;

    } catch(exception) {
        logger.error('Error from NOMIS: ' + exception);
        throw exception;
    }
}

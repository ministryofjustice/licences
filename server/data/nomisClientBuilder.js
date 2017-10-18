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
            const path = url.resolve(`${apiUrl}`, `${apiRoot}/releases`);
            const query = {nomisId: nomisIds};
            return callNomis(path, query, token);
        },

        getBookings: function(nomisId) {
            const path = url.resolve(`${apiUrl}`, `${apiRoot}/bookings`);
            const query = {query: `offenderNo:eq:${nomisId}`};
            return callNomis(path, query, token);
        },

        getBooking: function(bookingId) {
            const path = url.resolve(`${apiUrl}`, `${apiRoot}/bookings/${bookingId}`);
            return callNomis(path, '', token);
        },

        getSentenceDetail: function(bookingId) {
            const path = url.resolve(`${apiUrl}`, `${apiRoot}/bookings/${bookingId}/sentenceDetail`);
            return callNomis(path, '', token);
        },

        getImageInfo: function(imageId) {
            const path = url.resolve(`${apiUrl}`, `${apiRoot}/images/${imageId}`);
            return callNomis(path, '', token);
        }
    };
};

function callNomis(path, query, token) {

    const gwToken = process.env.NODE_ENV === 'production' ? `Bearer ${generateApiGatewayToken()}` : 'dummy';

    return new Promise((resolve, reject) => {
        superagent
            .get(path)
            .query(query)
            .set('Accept', 'application/json')
            .set('Authorization', gwToken)
            .set('Elite-Authorization', token)
            .timeout(timeoutSpec)
            .end((error, res) => {
                try {
                    if (error) {
                        logger.error('Error querying NOMIS: ' + error);
                        return reject(error);
                    }

                    if (res.body) {
                        return resolve(res.body);
                    }

                    logger.error('Invalid nomis search response');
                    return reject({message: 'invalid search response', status: 500});

                } catch (exception) {
                    logger.error('Exception querying NOMIS: ' + exception);
                    return reject(exception);
                }
            });
    });
}

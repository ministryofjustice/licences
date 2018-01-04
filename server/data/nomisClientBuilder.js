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

        getUpcomingReleasesByUser: function() {
            const path = `${apiUrl}/users/me/offender-releases`;
            // todo add cutoff date
            const headers = {'Page-Limit': 50}; // todo pagination?
            return nomisGet(path, '', token, headers);
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

        getImageInfo: function(imageId) {
            const path = `${apiUrl}/images/${imageId}`;
            return nomisGet(path, '', token);
        },

        getDischargeAddress: function(nomisId) {
            const path = `${apiUrl}/dischargeAddress`;
            const query = {nomisId: `${nomisId}`};
            return nomisGet(path, query, token);
        },

        getHdcEligiblePrisoners: function() {
            return [
                {
                    bookingId: 0,
                    offenderNo: 'A12345',
                    firstName: 'Mark',
                    middleNames: '',
                    lastName: 'Andrews',
                    agencyLocationDesc: 'HMP Berwin',
                    internalLocationDesc: 'A-C-2-002',
                    hdced: '2017-09-07',
                    crd: '2017-12-15',
                    receptionDate: '2018-01-03'
                }
            ];
        }
    };
};

async function nomisGet(path, query, token, headers = {}) {

    try {
        const gwToken = `Bearer ${generateApiGatewayToken()}`;

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

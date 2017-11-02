const config = require('../config');
const logger = require('../../log.js');

const superagent = require('superagent');

const timeoutSpec = {
    response: config.establishments.timeout.response,
    deadline: config.establishments.timeout.deadline
};

const apiUrl = config.establishments.apiUrl;

module.exports = {
    findById: function(agencyId) {
        const path = `${apiUrl}/establishments/${agencyId}`;
        return doGet(path);
        }
    };

async function doGet(path, query = {}, headers = {}) {

    try {
        const result = await superagent
            .get(path)
            .query(query)
            .set('Accept', 'application/json')
            .set(headers)
            .timeout(timeoutSpec);

        return result.body;

    } catch(exception) {
        logger.error('Error from ESTABLISHMENTS API: ' + exception);
        throw exception;
    }
}

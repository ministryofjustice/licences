'use strict';

const config = require('../config');
const logger = require('../../log.js');

const superagent = require('superagent');
const url = require('url');

const timeoutSpec = {
    response: config.nomis.timeout.response,
    deadline: config.nomis.timeout.deadline
};

const queryUrl = url.resolve(`${config.nomis.apiUrl}`, 'api/v2/releases');

module.exports = {
    getReleases
};

function getReleases(nomisIds) {
    return new Promise((resolve, reject) => {

        const queryParams = {nomisId: nomisIds};

        superagent
            .get(queryUrl)
            .query(queryParams)
            .set('Accept', 'application/json')
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

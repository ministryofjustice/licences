'use strict';

const config = require('../config');
const logger = require('../../log.js');

const superagent = require('superagent');
const url = require('url');

const timeoutSpec = {
    response: config.nomis.timeout.response,
    deadline: config.nomis.timeout.deadline
};

const endpoint = config.nomis.apiUrl;

module.exports = {
    getUpcomingReleases,
    getPrisonerInfo
};

function getUpcomingReleases(nomisIds) {

    const path = url.resolve(`${endpoint}`, 'api/v2/releases');
    const query = {nomisId: nomisIds};

    return callNomis(path, query);
}

function getPrisonerInfo(nomisId) {

    const path = url.resolve(`${endpoint}`, 'api/v2/prisoners');
    const query = {nomisId: nomisId};

    return callNomis(path, query);
}

function callNomis(path, query) {
    return new Promise((resolve, reject) => {
        superagent
            .get(path)
            .query(query)
            .set('Accept', 'application/json')
            .set('Authorization', 'token')
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

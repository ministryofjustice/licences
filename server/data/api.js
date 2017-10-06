'use strict';

const config = require('../config');
const logger = require('../../log.js');

const superagent = require('superagent');
const url = require('url');

const timeoutSpec = {
    response: config.licences.timeout.response,
    deadline: config.licences.timeout.deadline
};

const endpoint = config.licences.apiUrl;

module.exports = {
    getUpcomingReleases,
    getPrisonerInfo
};

function getUpcomingReleases(staffId) {

    const path = url.resolve(`${endpoint}`, 'api/releases');
    const query = {staffId: staffId};

    return callApi(path, query);
}

function getPrisonerInfo(nomisId) {

    const path = url.resolve(`${endpoint}`, 'api/prisoners');
    const query = {nomisId: nomisId};

    return callApi(path, query);
}

function callApi(path, query) {
    return superagent
        .get(path)
        .query(query)
        .set('Accept', 'application/json')
        .timeout(timeoutSpec)
        .then(res => {
            if (res.body) {
                return res.body;
            }

            logger.error('Invalid API search response');
            throw new Error('invalid search response');
        });
}

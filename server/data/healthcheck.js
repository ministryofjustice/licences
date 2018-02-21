const config = require('../config.js');
const {getCollection} = require('./dataAccess/dbMethods');
const logger = require('../../log.js');

const superagent = require('superagent');

const generateApiGatewayToken = require('../authentication/apiGateway');

module.exports = {
    nomisApiCheck,
    dbCheck
};

function dbCheck() {
    return new Promise((resolve, reject) => {
        getCollection('SELECT 1 AS [ok]', null, resolve, reject);
    });
}

function nomisApiCheck() {
    return new Promise((resolve, reject) => {

        superagent
            .get(`${getHealthcheckUrl()}/health`)
            .set('Authorization', generateApiGatewayToken())
            .timeout({
                response: 4000,
                deadline: 4500
            })
            .end((error, result) => {
                try {
                    if (error) {
                        logger.error(error, 'Error calling Nomis API');
                        return reject(`${error.status} | ${error.code} | ${error.errno}`);
                    }

                    if (result.status === 200) {
                        return resolve('OK');
                    }

                    return reject(result.status);
                } catch (error) {
                    logger.error(error, 'Exception calling Nomis API');
                    return reject(error);
                }
            });
    });
}

function getHealthcheckUrl() {
    return config.nomis.apiUrl.replace('/api', '');
}

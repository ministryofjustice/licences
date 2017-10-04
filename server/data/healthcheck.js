const config = require('../../server/config.js');
const {getCollection} = require('./dataAccess/dbData');
const logger = require('../../log.js');

const url = require('url');
const superagent = require('superagent');

module.exports = {
    licencesApiCheck,
    dbCheck
};

function dbCheck() {
    return new Promise((resolve, reject) => {
        getCollection('SELECT 1 AS [ok]', null, resolve, reject);
    });
}

function licencesApiCheck() {
    return new Promise((resolve, reject) => {

        superagent
            .get(url.resolve(`${config.licences.apiUrl}`, '/api/health'))
            .timeout({
                response: 2000,
                deadline: 2500
            })
            .end((error, result) => {
                try {
                    if (error) {
                        logger.error(error, 'Error calling Licences API');
                        return reject(error.status);
                    }

                    if (result.status === 200) {
                        return resolve('OK');
                    }

                    return reject(result.status);
                } catch (exception) {
                    logger.error(exception, 'Exception calling Licences API');
                    return reject(exception);
                }
            });
    });
}


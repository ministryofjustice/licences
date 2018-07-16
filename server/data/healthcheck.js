const config = require('../config.js');
const db = require('./dataAccess/db');
const logger = require('../../log.js');
const superagent = require('superagent');


module.exports = {
    nomisApiCheck,
    dbCheck,
    pdfApiCheck
};

function dbCheck() {
    return db.query('SELECT 1 AS ok');
}

function nomisApiCheck() {
    return new Promise((resolve, reject) => {

        superagent
            .get(`${getHealthcheckUrl()}/health`)
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

function pdfApiCheck() {
    return new Promise((resolve, reject) => {

        superagent
            .get(`${config.pdf.pdfServiceHost}/health`)
            .timeout({
                response: 4000,
                deadline: 4500
            })
            .end((error, result) => {
                try {
                    if (error) {
                        logger.error(error, 'Error calling PDF API');
                        return reject(`${error.status} | ${error.code} | ${error.errno}`);
                    }

                    if (result.status === 200) {
                        return resolve('OK');
                    }

                    return reject(result.status);
                } catch (error) {
                    logger.error(error, 'Exception calling PDF API');
                    return reject(error);
                }
            });
    });
}

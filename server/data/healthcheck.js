/* eslint-disable prefer-promise-reject-errors */
const superagent = require('superagent')
const config = require('../config.js')
const db = require('./dataAccess/db')
const logger = require('../../log.js')

module.exports = {
    nomisApiCheck,
    dbCheck,
    pdfApiCheck,
    authCheck,
}

function dbCheck() {
    return db.query('SELECT 1 AS ok')
}

function nomisApiCheck() {
    return new Promise((resolve, reject) => {
        superagent
            .get(`${getHealthcheckUrl()}/health`)
            .timeout({
                response: 4000,
                deadline: 4500,
            })
            .end((error, result) => {
                try {
                    if (error) {
                        logger.error(error.stack, 'Error calling Nomis API')
                        return reject(`${error.status} | ${error.code} | ${error.errno}`)
                    }

                    if (result.status === 200) {
                        return resolve('OK')
                    }

                    return reject(result.status)
                } catch (apiError) {
                    logger.error(apiError.stack, 'Exception calling Nomis API')
                    return reject(apiError)
                }
            })
    })
}

function getHealthcheckUrl() {
    return config.nomis.apiUrl.replace('/api', '')
}

function pdfApiCheck() {
    return new Promise((resolve, reject) => {
        superagent
            .get(`${config.pdf.pdfServiceHost}/health`)
            .timeout({
                response: 4000,
                deadline: 4500,
            })
            .end((error, result) => {
                try {
                    if (error) {
                        logger.error(error.stack, 'Error calling PDF API')
                        return reject(`${error.status} | ${error.code} | ${error.errno}`)
                    }

                    if (result.status === 200) {
                        return resolve('OK')
                    }

                    return reject(result.status)
                } catch (apiError) {
                    logger.error(apiError.stack, 'Exception calling PDF API')
                    return reject(apiError)
                }
            })
    })
}

function authCheck() {
    return new Promise((resolve, reject) => {
        superagent
            .get(`${config.nomis.authUrl}/health`)
            .timeout({
                response: 4000,
                deadline: 4500,
            })
            .end((error, result) => {
                try {
                    if (error) {
                        logger.error(error.stack, 'Error calling Auth service')
                        return reject(`${error.status} | ${error.code} | ${error.errno}`)
                    }

                    if (result.status === 200) {
                        return resolve('OK')
                    }

                    return reject(result.status)
                } catch (apiError) {
                    logger.error(apiError.stack, 'Exception calling Auth service')
                    return reject(apiError)
                }
            })
    })
}

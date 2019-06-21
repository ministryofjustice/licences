/* eslint-disable prefer-promise-reject-errors */
const superagent = require('superagent')
const config = require('../config.js')
const db = require('./dataAccess/db')
const logger = require('../../log.js')

module.exports = {
  nomisApiCheck,
  deliusApiCheck,
  dbCheck,
  pdfApiCheck,
  authCheck,
}

function dbCheck() {
  return db.query('SELECT 1 AS ok')
}

function pdfApiCheck() {
  return serviceApiCheck('pdf', `${config.pdf.pdfServiceHost}/health`)
}

function nomisApiCheck() {
  return serviceApiCheck('nomis', `${getHealthcheckUrl('nomis')}/health`)
}

function deliusApiCheck() {
  return serviceApiCheck('delius', `${getHealthcheckUrl('delius')}/health`)
}

function getHealthcheckUrl(name) {
  return config[name].apiUrl.replace('/api', '')
}

const serviceApiCheck = (name, url) => {
  return new Promise((resolve, reject) => {
    superagent
      .get(url)
      .timeout({
        response: 4000,
        deadline: 4500,
      })
      .end((error, result) => {
        try {
          if (error) {
            logger.error(error.stack, `Error calling ${name} API`)
            return reject(`${error.status} | ${error.code} | ${error.errno}`)
          }

          if (result.status === 200) {
            return resolve('OK')
          }

          return reject(result.status)
        } catch (apiError) {
          logger.error(apiError.stack, `Exception calling ${name} API`)
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

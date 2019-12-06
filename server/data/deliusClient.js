/**
 * @typedef {import("../../types/delius").DeliusClient} DeliusClient
 */
const superagent = require('superagent')
const logger = require('../../log')
const config = require('../config')

const timeoutSpec = {
  response: config.nomis.timeout.response,
  deadline: config.nomis.timeout.deadline,
}

const apiUrl = `${config.delius.apiUrl}${config.delius.apiPrefix}`

/**
 * @return { DeliusClient }
 */
module.exports = signInService => {
  return {
    getStaffDetailsByStaffCode(staffCode) {
      return get(`${apiUrl}/staff/staffCode/${staffCode}`)
    },

    getStaffDetailsByUsername(username) {
      return get(`${apiUrl}/staff/username/${username}`)
    },

    getROPrisoners(deliusStaffCode) {
      return get(`${apiUrl}/staff/staffCode/${deliusStaffCode}/managedOffenders`)
    },

    getAllOffenderManagers(offenderNo) {
      return get(`${apiUrl}/offenders/nomsNumber/${offenderNo}/allOffenderManagers`)
    },
  }

  async function get(path) {
    const token = await signInService.getAnonymousClientCredentialsTokens('delius')
    if (!token) {
      throw Error(`Failed to get token when attempting to call delius: ${path}`)
    }

    try {
      logger.debug(`GET ${path}`)
      const result = await superagent
        .get(path)
        .set('Authorization', `Bearer ${token.token}`)
        .timeout(timeoutSpec)
      logger.debug(`GET ${path} -> ${result.status}`)

      return result.body
    } catch (error) {
      logger.warn('Error calling delius', path, error.response, error.stack)
      throw error
    }
  }
}

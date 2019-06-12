const superagent = require('superagent')
const logger = require('../../log')
const config = require('../config')
const { unauthorisedError } = require('../utils/errors')

const timeoutSpec = {
  response: config.nomis.timeout.response,
  deadline: config.nomis.timeout.deadline,
}

const { apiUrl } = config.delius

module.exports = signInService => {
  return {
    getROPrisoners(deliusStaffCode) {
      const path = `${apiUrl}/staff/staffCode/${deliusStaffCode}/managedOffenders`
      const query = { current: true }
      return deliusGet({ path, query })
    },

    getResponsibleOfficer(offenderNo) {
      const path = `${apiUrl}/offenders/nomsNumber/${offenderNo}/responsibleOfficers`
      const query = { current: true }
      return deliusGet({ path, query })
    },
  }

  async function deliusGet({ path, query = '' } = {}) {
    const token = await signInService.getAnonymousClientCredentialsTokens('delius')
    if (!token) {
      throw unauthorisedError()
    }

    try {
      const result = await superagent
        .get(path)
        .query(query)
        .set('Authorization', `Bearer ${token.token}`)
        .timeout(timeoutSpec)

      return result.body
    } catch (error) {
      logger.warn('Error calling delius', path, error.stack)
      throw error
    }
  }
}

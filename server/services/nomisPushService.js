const logger = require('../../log.js')
const { getIn } = require('../utils/functionalHelpers')
const { statusValues, statusReasonValues } = require('./config/approvalStatuses')
const { nomisPushError } = require('../utils/errors')

module.exports = (nomisClientBuilder, signInService) => {
  async function pushStatus({ bookingId, data, username }) {
    const approvalStatus = getApprovalStatus(data)

    if (!approvalStatus) {
      logger.info('No approval status to push to nomis')
      return null
    }

    const systemTokens = await signInService.getClientCredentialsTokens(username)
    const nomisClient = nomisClientBuilder(systemTokens.token)

    logger.info('Pushing approval status to nomis', approvalStatus)
    try {
      return await nomisClient.putApprovalStatus(bookingId, approvalStatus)
    } catch (error) {
      if (error.status === 409) {
        logger.error(`409 CONFLICT when posting approval status for booking id: ${bookingId}`)
        throw nomisPushError('Approval Status')
      }
      throw error
    }
  }

  async function pushChecksPassed({ bookingId, passed, username }) {
    const systemTokens = await signInService.getClientCredentialsTokens(username)
    const nomisClient = nomisClientBuilder(systemTokens.token)

    logger.info(`Pushing checks passed=${passed} to nomis for bookingId: ${bookingId}`)
    try {
      return await nomisClient.putChecksPassed({ bookingId, passed })
    } catch (error) {
      if (error.status === 409) {
        logger.error(`409 CONFLICT when posting checks passed for booking id: ${bookingId}`)
        throw nomisPushError('Checks Done')
      }
      throw error
    }
  }

  async function resetHDC(bookingId, username) {
    const systemTokens = await signInService.getClientCredentialsTokens(username)
    const nomisClient = nomisClientBuilder(systemTokens.token)

    logger.info(`Resetting checks passed to null for bookingId: ${bookingId}`)
    try {
      return await nomisClient.resetHDC(bookingId)
    } catch (error) {
      if (error.status === 409) {
        logger.error(`409 CONFLICT when deleting checks passed for booking id: ${bookingId}`)
        throw nomisPushError('Checks passed could not be deleted')
      }
      throw error
    }
  }

  return {
    pushStatus,
    pushChecksPassed,
    resetHDC,
  }
}

function getApprovalStatus({ type, status, reason }) {
  return reason ? getIn(statusReasonValues, [type, status, pick(reason)]) : getIn(statusValues, [type, status])
}

function pick(reason) {
  return [].concat(reason)[0]
}

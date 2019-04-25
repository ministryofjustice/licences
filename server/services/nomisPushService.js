const logger = require('../../log.js')
const { getIn } = require('../utils/functionalHelpers')
const { statusValues, statusReasonValues } = require('./config/approvalStatuses')

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
    return nomisClient.putApprovalStatus(bookingId, approvalStatus)
  }

  async function pushChecksPassed({ bookingId, passed, username }) {
    const systemTokens = await signInService.getClientCredentialsTokens(username)
    const nomisClient = nomisClientBuilder(systemTokens.token)

    logger.info(`Pushing checks passed=${passed} to nomis for bookingId: ${bookingId}`)
    return nomisClient.putChecksPassed({ bookingId, passed })
  }

  return {
    pushStatus,
    pushChecksPassed,
  }
}

function getApprovalStatus({ type, status, reason }) {
  return reason ? getIn(statusReasonValues, [type, status, pick(reason)]) : getIn(statusValues, [type, status])
}

function pick(reason) {
  return [].concat(reason)[0]
}

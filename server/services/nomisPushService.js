const logger = require('../../log.js')
const { getIn } = require('../utils/functionalHelpers')
const { statusValues, statusReasonValues } = require('./config/approvalStatuses')

module.exports = (nomisClientBuilder, signInService) => {
  async function pushStatus(bookingId, dataObject, userName) {
    const approvalStatus = getApprovalStatus(dataObject)

    if (!approvalStatus) {
      logger.info('No approval status to push to nomis')
      return null
    }

    const systemToken = await signInService.getClientCredentialsTokens(userName)
    const nomisClient = nomisClientBuilder(systemToken)

    logger.info('Pushing approval status to nomis', approvalStatus)
    return nomisClient.putApprovalStatus(bookingId, approvalStatus)
  }

  async function pushChecksPassed(bookingId, userName) {
    const systemToken = await signInService.getClientCredentialsTokens(userName)
    const nomisClient = nomisClientBuilder(systemToken)

    logger.info('Pushing checks passed to nomis')
    return nomisClient.putChecksPassed(bookingId)
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

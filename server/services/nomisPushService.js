const logger = require('../../log')
const { getIn } = require('../utils/functionalHelpers')
const { statusValues, statusReasonValues } = require('./config/approvalStatuses')
const { cvlEventConfig } = require('./config/cvlEventConfig')
const { nomisPushError } = require('../utils/errors')

module.exports = (nomisClientBuilder, signInService, hdcService) => {
  async function pushStatus({ bookingId, data, username, licenceId, offenderNo }) {
    const approvalStatus = getApprovalStatus(data)
    const eventType = data.type

    if (!approvalStatus) {
      logger.info('No approval status to push to nomis')
      return null
    }
    const shouldPostCvlEvent = Object.keys(cvlEventConfig).some((key) => key === eventType)
    const systemToken = await signInService.getClientCredentialsTokens(username)
    const nomisClient = nomisClientBuilder(systemToken)

    logger.info({ approvalStatus }, 'Pushing approval status to nomis')
    try {
      if (shouldPostCvlEvent) {
        const { cvlEventType, cvlEventReason } = getCvlEventData(data)
        await hdcService.postCvlEvent({
          eventType: cvlEventType,
          bookingId: parseInt(bookingId, 10),
          licenceId,
          nomsNumber: offenderNo,
          triggeredBy: username,
          reason: cvlEventReason
        })
      }
      return await nomisClient.putApprovalStatus(bookingId, approvalStatus)
    } catch (error) {
      // @ts-ignore
      if (error.status === 409) {
        logger.error(`409 CONFLICT when posting approval status for booking id: ${bookingId}`)
        throw nomisPushError('Approval Status')
      }
      throw error
    }
  }

  async function pushChecksPassed({ bookingId, passed, username, licenceId, offenderNo }) {
    const systemToken = await signInService.getClientCredentialsTokens(username)
    const nomisClient = nomisClientBuilder(systemToken)

    logger.info(`Pushing checks passed=${passed} to nomis for bookingId: ${bookingId}`)
    try {
       if (passed) {
        await hdcService.postCvlEvent({
          eventType: 'ELIGIBLE',
          bookingId: parseInt(bookingId, 10),
          licenceId,
          nomsNumber: offenderNo,
          triggeredBy: username,
          reason: `${username} passed eligibility checks for HDC`
        })
      }
      return await nomisClient.putChecksPassed({ bookingId, passed })
    } catch (error) {
      // @ts-ignore
      if (error.status === 409) {
        logger.error(`409 CONFLICT when posting checks passed for booking id: ${bookingId}`)
        throw nomisPushError('Checks Done')
      }
      throw error
    }
  }

  async function resetHDC(bookingId, username) {
    const systemToken = await signInService.getClientCredentialsTokens(username)
    const nomisClient = nomisClientBuilder(systemToken)

    logger.info(`Resetting checks passed to null for bookingId: ${bookingId}`)
    try {
      return await nomisClient.resetHDC(bookingId)
    } catch (error) {
      // @ts-ignore
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

function getCvlEventData({ type, status, reason, cvlEventReason }) {
  const aReason = reason ? pick(reason) : ''
  return {
    cvlEventType: aReason? cvlEventConfig[type][status][aReason].eventType : cvlEventConfig[type][status].eventType,
    cvlEventReason: cvlEventReason || aReason
  }
}

function getApprovalStatus({ type, status, reason }) {
  return reason ? getIn(statusReasonValues, [type, status, pick(reason)]) : getIn(statusValues, [type, status])
}

function pick(reason) {
  return [].concat(reason)[0]
}

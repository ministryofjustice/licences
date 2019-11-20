const setCase = require('case')
const logger = require('../../log.js')
const { getIn, isEmpty } = require('../utils/functionalHelpers')

module.exports = function createDeliusRoService(deliusClient, nomisClientBuilder) {
  async function getStaffByCode(staffCode) {
    try {
      return await deliusClient.getStaffDetailsByStaffCode(staffCode)
    } catch (error) {
      if (error.status === 404) {
        logger.warn(`Staff member not found in delius for code: ${staffCode}`)
        return null
      }

      logger.error(`Problem retrieving staff member for code: ${staffCode}`, error.stack)
      throw error
    }
  }

  async function getStaffByUsername(username) {
    try {
      return await deliusClient.getStaffDetailsByUsername(username)
    } catch (error) {
      if (error.status === 404) {
        logger.warn(`Staff member not found in delius for username: ${username}`)
        return null
      }

      logger.error(`Problem retrieving staff member for username: ${username}`, error.stack)
      throw error
    }
  }

  async function getROPrisonersFromDelius(staffCode) {
    try {
      return await deliusClient.getROPrisoners(staffCode)
    } catch (error) {
      if (error.status === 404) {
        logger.warn(`Staff member not found in delius: ${staffCode}`)
        return []
      }

      logger.error(`Problem retrieving RO prisoners for: ${staffCode}`, error.stack)
      throw error
    }
  }

  async function getROPrisoners(staffCode, token) {
    const nomisClient = nomisClientBuilder(token)
    const requiredPrisoners = await getROPrisonersFromDelius(staffCode)
    if (!isEmpty(requiredPrisoners)) {
      const requiredIDs = requiredPrisoners.map(prisoner => prisoner.nomsNumber)
      return nomisClient.getOffenderSentencesByNomisId(requiredIDs)
    }

    return []
  }

  async function findResponsibleOfficer(bookingId, token) {
    const nomisClient = nomisClientBuilder(token)
    const { offenderNo } = await nomisClient.getBooking(bookingId)
    return findResponsibleOfficerByOffenderNo(offenderNo)
  }

  async function findResponsibleOfficerByOffenderNo(offenderNo) {
    logger.info(`findResponsibleOfficer: ${offenderNo}`)

    try {
      const com = await deliusClient.getResponsibleOfficer(offenderNo)

      return formatCom(com)
    } catch (error) {
      if (error.status === 404) {
        logger.error(`RO relationship not found for booking id: ${offenderNo}`)
        return { message: 'No RO relationship' }
      }

      logger.error(`findResponsibleOfficer for: ${offenderNo}`, error.stack)
      throw error
    }
  }

  return {
    getStaffByCode,
    getStaffByUsername,
    getROPrisoners,
    formatCom,
    findResponsibleOfficer,
    findResponsibleOfficerByOffenderNo,
  }
}

function formatCom(com) {
  const message = getIn(com, ['message']) || null

  if (com && com[0]) {
    const { forenames, surname, staffCode, ...rest } = com[0]
    const name = setCase.capital(
      [forenames, surname]
        .join(' ')
        .trim()
        .toLowerCase()
    )
    return {
      name: name || null,
      deliusId: getIn(com, [0, 'staffCode']) || null,
      ...rest,
    }
  }

  return {
    deliusId: null,
    name: null,
    message,
  }
}

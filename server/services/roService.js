/**
 * @typedef {import("../../types/delius").DeliusClient} DeliusClient
 * @typedef {import("../../types/licences").RoService} RoService
 * @typedef {import("../../types/delius").CommunityOrPrisonOffenderManager} CommunityOrPrisonOffenderManager
 * @typedef {import("../../types/licences").ResponsibleOfficerResult} ResponsibleOfficerResult
 */
const setCase = require('case')
const logger = require('../../log.js')
const { getIn, isEmpty } = require('../utils/functionalHelpers')

/**
 * @param {DeliusClient} deliusClient
 * @returns {RoService} roService
 */
module.exports = function createRoService(deliusClient, nomisClientBuilder) {
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

  /**
   * @deprecated will move to use findResponsibleOfficerWithOffenderNo, once new endpoint in prod
   */
  async function findResponsibleOfficer(bookingId, token) {
    const nomisClient = nomisClientBuilder(token)
    const { offenderNo } = await nomisClient.getBooking(bookingId)
    return findResponsibleOfficerByOffenderNo(offenderNo)
  }

  /**
   * @deprecated will delete, and move to use findResponsibleOfficerWithOffenderNo, once new endpoint in prod
   */
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

  async function findResponsibleOfficerByBookingId(bookingId, token) {
    const nomisClient = nomisClientBuilder(token)
    const { offenderNo } = await nomisClient.getBooking(bookingId)
    return findResponsibleOfficerWithOffenderNo(offenderNo)
  }

  async function findResponsibleOfficerWithOffenderNo(offenderNo) {
    logger.info(`findResponsibleOfficerWithOffenderNo: ${offenderNo}`)

    try {
      const offenderManagers = await deliusClient.getAllOffenderManagers(offenderNo)
      return extractOffenderManager(offenderNo, offenderManagers)
    } catch (error) {
      if (error.status === 404) {
        logger.error(`Offender not present in delius: ${offenderNo}`)
        return { message: 'Offender not present in delius' }
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
    findResponsibleOfficerByBookingId,
  }
}

/**
 * @deprecated will delete, and move to use findResponsibleOfficerWithOffenderNo, once new endpoint in prod
 */
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
      nomsNumber: rest.nomsNumber,
      lduCode: rest.lduCode,
      lduDescription: rest.lduDescription,
      probationAreaCode: rest.probationAreaCode,
      probationAreaDescription: rest.probationAreaDescription,
    }
  }

  return { message }
}

/**
 * @param {CommunityOrPrisonOffenderManager[]} offenderManagers
 * @returns {ResponsibleOfficerResult}
 */
function extractOffenderManager(offenderNumber, offenderManagers) {
  const responsibleOfficer = offenderManagers.find(
    manager => manager.isResponsibleOfficer && !manager.isPrisonOffenderManager
  )
  if (!responsibleOfficer) {
    return { message: `Offender has not been assigned a COM: ${offenderNumber}` }
  }
  if (responsibleOfficer.isUnallocated) {
    // TODO: Need to potentially alert clearing office, if not assigned.
    logger.warn(`responsible officer is an 'unallocated user': ${offenderNumber}`)
  }
  const {
    staff: { forenames, surname },
    staffCode,
    team: { localDeliveryUnit },
    probationArea,
  } = responsibleOfficer
  const name = setCase.capital(
    [forenames, surname]
      .join(' ')
      .trim()
      .toLowerCase()
  )
  return {
    name,
    deliusId: staffCode,
    nomsNumber: offenderNumber,
    lduCode: localDeliveryUnit.code,
    lduDescription: localDeliveryUnit.description,
    probationAreaCode: probationArea.code,
    probationAreaDescription: probationArea.description,
  }
}

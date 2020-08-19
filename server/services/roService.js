/**
 * @typedef {import("../../types/delius").DeliusClient} DeliusClient
 * @typedef {import("../../types/licences").RoService} RoService
 * @typedef {import("../../types/delius").CommunityOrPrisonOffenderManager} CommunityOrPrisonOffenderManager
 * @typedef {import("../../types/licences").ResponsibleOfficerResult} ResponsibleOfficerResult
 * @typedef {import("../../types/licences").ResponsibleOfficer} ResponsibleOfficer
 */
const setCase = require('case')
const logger = require('../../log.js')
const { NO_OFFENDER_NUMBER, NO_COM_ASSIGNED, STAFF_NOT_PRESENT } = require('./serviceErrors')

/**
 * @param {DeliusClient} deliusClient
 * @returns {RoService} roService
 */
module.exports = function createRoService(deliusClient, nomisClientBuilder) {
  async function getROPrisonersFromDelius(staffCode) {
    try {
      return await deliusClient.getROPrisoners(staffCode)
    } catch (error) {
      logger.error(`Problem retrieving RO prisoners for: ${staffCode}`, error.stack)
      throw error
    }
  }

  return {
    async getStaffByCode(staffCode) {
      try {
        const result = await deliusClient.getStaffDetailsByStaffCode(staffCode)
        return result || { code: STAFF_NOT_PRESENT, message: `Staff does not exist in delius: ${staffCode}` }
      } catch (error) {
        logger.error(`Problem retrieving staff member for code: ${staffCode}`, error.stack)
        throw error
      }
    },

    async getStaffByUsername(username) {
      const staffDetails = await deliusClient.getStaffDetailsByUsername(username)
      if (!staffDetails) {
        logger.warn(`Staff member not found in delius for username: ${username}`)
        return null
      }
      return staffDetails
    },

    async getROPrisoners(staffCode, token) {
      const nomisClient = nomisClientBuilder(token)
      const requiredPrisoners = await getROPrisonersFromDelius(staffCode)
      if (!requiredPrisoners) {
        return null
      }

      const requiredIDs = requiredPrisoners
        .filter((prisoner) => prisoner.nomsNumber)
        .map((prisoner) => prisoner.nomsNumber)
      return nomisClient.getOffenderSentencesByNomisId(requiredIDs)
    },

    async findResponsibleOfficer(bookingId, token) {
      const nomisClient = nomisClientBuilder(token)
      const { offenderNo } = await nomisClient.getBooking(bookingId)
      return this.findResponsibleOfficerByOffenderNo(offenderNo)
    },

    async findResponsibleOfficerByOffenderNo(offenderNo) {
      logger.info(`findResponsibleOfficerWithOffenderNo: ${offenderNo}`)

      try {
        const offenderManagers = await deliusClient.getAllOffenderManagers(offenderNo)
        if (!offenderManagers) {
          logger.error(`Offender not present in delius: ${offenderNo}`)
          return { code: NO_OFFENDER_NUMBER, message: 'Offender number not entered in delius' }
        }
        return extractCommunityOffenderManager(offenderNo, offenderManagers)
      } catch (error) {
        logger.error(`findResponsibleOfficer for: ${offenderNo}`, error.stack)
        throw error
      }
    },
  }
}

/**
 * @param {CommunityOrPrisonOffenderManager[]} offenderManagers
 * @returns {ResponsibleOfficerResult}
 */
function extractCommunityOffenderManager(offenderNumber, offenderManagers) {
  const responsibleOfficer = offenderManagers.find((manager) => !manager.isPrisonOffenderManager)
  return !responsibleOfficer
    ? { code: NO_COM_ASSIGNED, message: `Offender has not been assigned a COM: ${offenderNumber}` }
    : toResponsibleOfficer(offenderNumber, responsibleOfficer)
}

/**
 * @param {string} offenderNumber
 * @param {CommunityOrPrisonOffenderManager} offenderManager
 * @returns {ResponsibleOfficer}
 */
function toResponsibleOfficer(offenderNumber, offenderManager) {
  const {
    staff: { forenames, surname },
    staffCode,
    isUnallocated,
    team: { localDeliveryUnit, code, description },
    probationArea,
  } = offenderManager
  const name = setCase.capital([forenames, surname].join(' ').trim().toLowerCase())
  return {
    name,
    isAllocated: !isUnallocated,
    deliusId: staffCode,
    nomsNumber: offenderNumber,
    teamCode: code,
    teamDescription: description,
    lduCode: localDeliveryUnit.code,
    lduDescription: localDeliveryUnit.description,
    probationAreaCode: probationArea.code,
    probationAreaDescription: probationArea.description,
  }
}

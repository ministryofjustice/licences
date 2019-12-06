/**
 * @typedef {import("../../types/delius").DeliusClient} DeliusClient
 * @typedef {import("../../types/licences").RoService} RoService
 * @typedef {import("../../types/delius").CommunityOrPrisonOffenderManager} CommunityOrPrisonOffenderManager
 * @typedef {import("../../types/licences").ResponsibleOfficerResult} ResponsibleOfficerResult
 */
const setCase = require('case')
const logger = require('../../log.js')
const { isEmpty } = require('../utils/functionalHelpers')

/**
 * @param {DeliusClient} deliusClient
 * @returns {RoService} roService
 */
module.exports = function createRoService(deliusClient, nomisClientBuilder) {
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

  return {
    async getStaffByCode(staffCode) {
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
    },

    async getStaffByUsername(username) {
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
    },

    async getROPrisoners(staffCode, token) {
      const nomisClient = nomisClientBuilder(token)
      const requiredPrisoners = await getROPrisonersFromDelius(staffCode)
      if (!isEmpty(requiredPrisoners)) {
        const requiredIDs = requiredPrisoners.map(prisoner => prisoner.nomsNumber)
        return nomisClient.getOffenderSentencesByNomisId(requiredIDs)
      }

      return []
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
        return extractOffenderManager(offenderNo, offenderManagers)
      } catch (error) {
        if (error.status === 404) {
          logger.error(`Offender not present in delius: ${offenderNo}`)
          return { message: 'Offender not present in delius' }
        }

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
function extractOffenderManager(offenderNumber, offenderManagers) {
  const responsibleOfficer = offenderManagers.find(manager => !manager.isPrisonOffenderManager)
  if (!responsibleOfficer) {
    return { message: `Offender has not been assigned a COM: ${offenderNumber}` }
  }
  const {
    staff: { forenames, surname },
    staffCode,
    isUnallocated,
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
    isAllocated: !isUnallocated,
    deliusId: staffCode,
    nomsNumber: offenderNumber,
    lduCode: localDeliveryUnit.code,
    lduDescription: localDeliveryUnit.description,
    probationAreaCode: probationArea.code,
    probationAreaDescription: probationArea.description,
  }
}

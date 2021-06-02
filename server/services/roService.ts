import { CommunityOrPrisonOffenderManager, DeliusClient, StaffDetails } from '../data/deliusClient'
import { ResponsibleOfficer, ResponsibleOfficerResult, Result } from '../../types/licences'

const setCase = require('case')
const logger = require('../../log')
const { NO_OFFENDER_NUMBER, NO_COM_ASSIGNED, STAFF_NOT_PRESENT } = require('./serviceErrors')

// eslint-disable-next-line import/prefer-default-export
export class RoService {
  constructor(readonly deliusClient: DeliusClient, readonly nomisClientBuilder) {}

  private async getROPrisonersFromDeliusForStaffIdentifier(staffIdentifier: number): Promise<Array<any>> {
    try {
      return await this.deliusClient.getROPrisonersByStaffIdentifier(staffIdentifier)
    } catch (error) {
      logger.error(`Problem retrieving RO prisoners for: ${staffIdentifier}`, error.stack)
      throw error
    }
  }

  async getStaffByStaffIdentifier(staffIdentifier: number): Promise<Result<StaffDetails>> {
    try {
      const result = await this.deliusClient.getStaffDetailsByStaffIdentifier(staffIdentifier)
      return result || { code: STAFF_NOT_PRESENT, message: `Staff does not exist in delius: ${staffIdentifier}` }
    } catch (error) {
      logger.error(`Problem retrieving staff member for staff identifier: ${staffIdentifier}`, error.stack)
      throw error
    }
  }

  async getStaffByUsername(username) {
    const staffDetails = await this.deliusClient.getStaffDetailsByUsername(username)
    if (!staffDetails) {
      logger.warn(`Staff member not found in delius for username: ${username}`)
      return null
    }
    return staffDetails
  }

  async getROPrisonersForStaffIdentifier(staffIdentifier: number, token: string) {
    const nomisClient = this.nomisClientBuilder(token)
    const requiredPrisoners = await this.getROPrisonersFromDeliusForStaffIdentifier(staffIdentifier)
    if (!requiredPrisoners) {
      return null
    }

    const requiredIDs = requiredPrisoners
      .filter((prisoner) => prisoner.nomsNumber)
      .map((prisoner) => prisoner.nomsNumber)
    return nomisClient.getOffenderSentencesByNomisId(requiredIDs)
  }

  async findResponsibleOfficer(bookingId, token): Promise<Result<ResponsibleOfficer>> {
    const nomisClient = this.nomisClientBuilder(token)
    const { offenderNo } = await nomisClient.getBooking(bookingId)
    return this.findResponsibleOfficerByOffenderNo(offenderNo)
  }

  async findResponsibleOfficerByOffenderNo(offenderNo): Promise<Result<ResponsibleOfficer>> {
    logger.info(`findResponsibleOfficerWithOffenderNo: ${offenderNo}`)

    try {
      const offenderManagers = await this.deliusClient.getAllOffenderManagers(offenderNo)
      if (!offenderManagers) {
        logger.error(`Offender not present in delius: ${offenderNo}`)
        return { code: NO_OFFENDER_NUMBER, message: 'Offender number not entered in delius' }
      }
      return extractCommunityOffenderManager(offenderNo, offenderManagers)
    } catch (error) {
      logger.error(`findResponsibleOfficer for: ${offenderNo}`, error.stack)
      throw error
    }
  }
}

function extractCommunityOffenderManager(
  offenderNumber: string,
  offenderManagers: CommunityOrPrisonOffenderManager[]
): ResponsibleOfficerResult {
  const responsibleOfficer = offenderManagers.find((manager) => !manager.isPrisonOffenderManager)
  return !responsibleOfficer
    ? { code: NO_COM_ASSIGNED, message: `Offender has not been assigned a COM: ${offenderNumber}` }
    : toResponsibleOfficer(offenderNumber, responsibleOfficer)
}

function toResponsibleOfficer(
  offenderNumber: string,
  offenderManager: CommunityOrPrisonOffenderManager
): ResponsibleOfficer {
  const {
    staff: { forenames, surname },
    staffCode,
    staffId,
    isUnallocated,
    team: { localDeliveryUnit, code, description },
    probationArea,
  } = offenderManager
  const name = setCase.capital([forenames, surname].join(' ').trim().toLowerCase())
  return {
    name,
    isAllocated: !isUnallocated,
    deliusId: staffCode,
    staffIdentifier: staffId,
    nomsNumber: offenderNumber,
    teamCode: code,
    teamDescription: description,
    lduCode: localDeliveryUnit.code,
    lduDescription: localDeliveryUnit.description,
    probationAreaCode: probationArea.code,
    probationAreaDescription: probationArea.description,
  }
}

import moment from 'moment'
import { CommunityManager, DeliusClient, StaffDetails } from '../data/deliusClient'
import { ResponsibleOfficer, ResponsibleOfficerResult, Result } from '../../types/licences'
import { OffenderSentence } from '../data/nomisClientTypes'
import { groupBy } from '../utils/functionalHelpers'

const setCase = require('case')
const logger = require('../../log')
const { NO_OFFENDER_NUMBER, NO_COM_ASSIGNED, STAFF_NOT_PRESENT } = require('./serviceErrors')

// eslint-disable-next-line import/prefer-default-export
export class RoService {
  constructor(
    readonly deliusClient: DeliusClient,
    readonly nomisClientBuilder
  ) {}

  private async getROPrisonersFromDeliusForStaffIdentifier(staffIdentifier: number): Promise<string[]> {
    try {
      return await this.deliusClient.getManagedPrisonerIdsByStaffId(staffIdentifier)
    } catch (error) {
      logger.error(`Problem retrieving RO prisoners for: ${staffIdentifier}`, error.stack)
      throw error
    }
  }

  getLatestSentences(offenderSentences: OffenderSentence[]): OffenderSentence[] {
    const groupedOffenderSentencess = groupBy(offenderSentences, ({ offenderNo }) => offenderNo)
    const latestOffenderSentences = Array.from(groupedOffenderSentencess.values()).flatMap((sentences) => {
      const hasNoDatesToCompare = sentences.find((b) => noDatesToCompare(b))
      if (hasNoDatesToCompare) {
        return sentences
      } else {
        const sortedSentences = sentences.sort((a, b) => {
          return moment(
            a.sentenceDetail.topupSupervisionExpiryCalculatedDate || a.sentenceDetail.licenceExpiryCalculatedDate
          ).diff(b.sentenceDetail.topupSupervisionExpiryCalculatedDate || b.sentenceDetail.licenceExpiryCalculatedDate)
        })
        return sortedSentences.pop()
      }
    })
    console.log('RETURNING THESE BOOKINGS:', latestOffenderSentences)
    return latestOffenderSentences
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
    const requiredIDs = await this.getROPrisonersFromDeliusForStaffIdentifier(staffIdentifier)
    if (!requiredIDs) {
      return null
    }
    return nomisClient.getOffenderSentencesByNomisId(requiredIDs).then(this.getLatestSentences)
  }

  async findResponsibleOfficer(bookingId, token): Promise<Result<ResponsibleOfficer>> {
    const nomisClient = this.nomisClientBuilder(token)
    const { offenderNo } = await nomisClient.getBooking(bookingId)
    return this.findResponsibleOfficerByOffenderNo(offenderNo)
  }

  async findResponsibleOfficerByOffenderNo(offenderNo): Promise<Result<ResponsibleOfficer>> {
    logger.info(`findResponsibleOfficerWithOffenderNo: ${offenderNo}`)

    try {
      const communityManager = await this.deliusClient.getCommunityManager(offenderNo)
      if (!communityManager) {
        logger.error(`Offender not present in delius: ${offenderNo}`)
        return { code: NO_OFFENDER_NUMBER, message: 'Offender number not entered in delius' }
      }
      return toResponsibleOfficer(offenderNo, communityManager)
    } catch (error) {
      logger.error(`findResponsibleOfficer for: ${offenderNo}`, error.stack)
      throw error
    }
  }
}

function toResponsibleOfficer(offenderNumber: string, offenderManager: CommunityManager): ResponsibleOfficer {
  const {
    name: { forenames, surname },
    code,
    staffId,
    isUnallocated,
    team,
    localAdminUnit: localDeliveryUnit,
    provider: probationArea,
  } = offenderManager
  const name = setCase.capital([forenames, surname].join(' ').trim().toLowerCase())
  return {
    name,
    isAllocated: !isUnallocated,
    deliusId: code,
    staffIdentifier: staffId,
    nomsNumber: offenderNumber,
    teamCode: team.code,
    teamDescription: team.description,
    lduCode: localDeliveryUnit.code,
    lduDescription: localDeliveryUnit.description,
    probationAreaCode: probationArea.code,
    probationAreaDescription: probationArea.description,
  }
}

function noDatesToCompare(booking): Boolean {
  return (
    !booking.sentenceDetail.topupSupervisionExpiryCalculatedDate && !booking.sentenceDetail.licenceExpiryCalculatedDate
  )
}

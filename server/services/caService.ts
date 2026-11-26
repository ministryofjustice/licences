import logger from '../../log'
import { unwrapResult } from '../utils/functionalHelpers'
import { NO_OFFENDER_NUMBER, LDU_INACTIVE, NO_COM_ASSIGNED, COM_NOT_ALLOCATED } from './serviceErrors'
import { RoService } from './roService'
import { ActiveLduClient } from '../data/activeLduClient'

export default class CaService {
  constructor(
    private readonly roService: RoService,
    private readonly activeLduClient: ActiveLduClient
  ) {}

  async getReasonForNotContinuing(bookingId: number, token: string): Promise<string | null> {
    const [ro, error] = unwrapResult(await this.roService.findResponsibleOfficer(bookingId, token))

    if (error) {
      logger.info(
        `Found reason for not continuing processing booking: ${bookingId}, error: ${error.code}:${error.message}`
      )
      switch (error.code) {
        case NO_OFFENDER_NUMBER:
          return NO_OFFENDER_NUMBER
        case NO_COM_ASSIGNED:
          // Handle NO_COM_ASSIGNED and COM_NOT_ALLOCATED in the same way
          return COM_NOT_ALLOCATED
        default:
          throw new Error(`Unexpected error received: ${error.code}: ${error.message}`)
      }
    }

    const { deliusId, lduCode, isAllocated, probationAreaCode } = ro

    const isLduActive = await this.activeLduClient.isLduPresent(lduCode, probationAreaCode)

    if (!isLduActive) {
      logger.info(
        `Blocking case for booking: '${bookingId}', as Ldu: '${lduCode}' in Probation Area: '${probationAreaCode}' is not currently active`
      )
      return LDU_INACTIVE
    }

    if (!isAllocated) {
      logger.info(`Blocking case for booking: '${bookingId}' as staff: '${deliusId}' is not allocated`)
      return COM_NOT_ALLOCATED
    }

    return null
  }
}

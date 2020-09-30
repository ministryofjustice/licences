import { isEmpty, unwrapResult } from '../utils/functionalHelpers'
import logger from '../../log'
import type { RoService } from './roService'
import type { ProbationTeamsClient } from '../data/probationTeamsClient'
import { ResponsibleOfficer, ResponsibleOfficerAndContactDetailsResult, Result } from '../../types/licences'

const logIfMissing = (val, message) => {
  if (isEmpty(val)) {
    logger.error(message)
  }
}

export interface DeliusContactDetails {
  email: string
  username: string
  functionalMailbox: string
  isUnlinkedAccount: boolean
  organisation: string
}

export class RoContactDetailsService {
  constructor(
    readonly userAdminService,
    readonly roService: RoService,
    readonly probationTeamsClient: ProbationTeamsClient
  ) {}

  private static extractContactDetails(locallyStoredRo): DeliusContactDetails {
    const { email, orgEmail, organisation, staffIdentifier } = locallyStoredRo
    logIfMissing(orgEmail, `Missing orgEmail for RO: ${staffIdentifier}`)
    logIfMissing(email, `Missing email for RO: ${staffIdentifier}`)
    logIfMissing(organisation, `Missing organisation for RO: ${staffIdentifier}`)

    return {
      isUnlinkedAccount: false,
      username: undefined,
      email,
      functionalMailbox: orgEmail,
      organisation,
    }
  }

  private async getContactDetailsFromDelius(ro: ResponsibleOfficer): Promise<Result<DeliusContactDetails>> {
    const { staffIdentifier, probationAreaCode, lduCode, lduDescription, teamCode } = ro
    logger.info(`looking up staff by staffIdentifier: ${staffIdentifier}`)
    const [staff, error] = unwrapResult(await this.roService.getStaffByStaffIdentifier(staffIdentifier))
    if (error) {
      return error
    }

    // Check that we don't have a mapping for the delius username locally
    if (staff.username) {
      const localRo = await this.userAdminService.getRoUserByDeliusUsername(staff.username)
      if (localRo) {
        return { ...RoContactDetailsService.extractContactDetails(localRo), username: staff.username }
      }
    }

    const functionalMailbox = await this.probationTeamsClient.getFunctionalMailbox({
      probationAreaCode,
      lduCode,
      teamCode,
    })
    logger.info(
      `Got functional mailbox: '${functionalMailbox}' for probation area '${probationAreaCode}', ldu ${lduCode}, team ${teamCode}'`,
      staff
    )
    return {
      isUnlinkedAccount: staff.username === undefined,
      username: staff.username,
      email: staff.email,
      functionalMailbox,
      organisation: `${lduDescription} (${lduCode})`,
    }
  }

  async getResponsibleOfficerWithContactDetails(
    bookingId: number,
    token: string
  ): Promise<ResponsibleOfficerAndContactDetailsResult> {
    const [deliusRo, error] = unwrapResult(await this.roService.findResponsibleOfficer(bookingId, token))

    if (error) {
      return error
    }

    const localRo = await this.userAdminService.getRoUserByStaffIdentifier(deliusRo.staffIdentifier)

    if (localRo) {
      return { ...deliusRo, ...RoContactDetailsService.extractContactDetails(localRo) }
    }

    const [deliusContactDetails, staffLookupError] = unwrapResult(await this.getContactDetailsFromDelius(deliusRo))

    if (staffLookupError) {
      return staffLookupError
    }

    return {
      ...deliusRo,
      ...deliusContactDetails,
    }
  }

  async getFunctionalMailBox(bookingId: number, token: string) {
    const [roOfficer, error] = unwrapResult(await this.getResponsibleOfficerWithContactDetails(bookingId, token))

    if (error) {
      logger.error(`Failed to retrieve RO for booking id: '${bookingId}'`, error.message)
      return null
    }
    return roOfficer.functionalMailbox
  }
}

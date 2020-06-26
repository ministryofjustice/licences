import R from 'ramda'

import { Fail, Success, Result } from '../utils/Result'
import { RoService } from './roService'
import { StaffDetails } from '../../types/delius'
import { LicenceClient } from '../data/licenceClient'
import { DeliusId } from '../data/licenceClientTypes'

const logger = require('../../log.js')
const { isEmpty } = require('../utils/functionalHelpers')

export = function createCaseListService(
  nomisClientBuilder,
  roService: RoService,
  licenceClient: LicenceClient,
  caseListFormatter
) {
  async function getCaseList(username, role, token): Promise<{ hdcEligible: any[]; message?: string }> {
    switch (role) {
      case 'PRISON':
      case 'CA':
      case 'DM':
        return getPrisonCaseList(token)

      case 'RO':
        return getROCaseList(username, token)

      default:
        throw Error(`Illegal state: unrecognised role ${role}`)
    }
  }

  const getPrisonCaseList = async (token) => {
    const hdcEligible = await nomisClientBuilder(token).getHdcEligiblePrisoners()
    return { hdcEligible }
  }

  /**
   * Assume username is assigned to an RO.  Look up this user in the local db (staff_ids table) and take the staff code.
   * Alternatively if a unique staff code cannot be found in this db, ask Delius for a staff code.
   */
  const getROCaseList = async (username, token) => {
    const staffCodeFromDb = await getStaffCodeFromDb(username)
    const staffCode = await staffCodeFromDb.orRecoverAsync(() => getStaffCodeFromDelius(username))
    const offendersForStaffCode = await staffCode.mapAsync(getOffendersForStaffCode(token))
    return offendersForStaffCode.match(R.identity, (message) => ({ hdcEligible: [], message }))
  }

  const getStaffCodeFromDb = async (username: string): Promise<Result<string, string>> => {
    const deliusIds = await licenceClient.getDeliusUserName(username)

    return validateDeliusIds(deliusIds)
      .flatMap(getDeliusId)
      .map((id) => id.staff_id.toUpperCase())
  }

  const getStaffCodeFromDelius = async (username: string): Promise<Result<string, string>> => {
    const staffDetailsResult = await getStaffDetailsFromDelius(username)

    return staffDetailsResult.flatMap(({ staffCode }) =>
      isEmpty(staffCode) ? Fail(`Delius did not supply a staff code for username ${username}`) : Success(staffCode)
    )
  }

  const getStaffDetailsFromDelius = async (username: string): Promise<Result<StaffDetails, string>> => {
    const staffDetails = await roService.getStaffByUsername(username)

    return isEmpty(staffDetails)
      ? Fail(`Staff details not found in Delius for username: ${username}`)
      : Success(staffDetails)
  }

  const validateDeliusIds = (deliusIds: DeliusId[]): Result<DeliusId[], string> =>
    !Array.isArray(deliusIds) || deliusIds.length < 1 || isEmpty(deliusIds[0].staff_id)
      ? Fail('Delius username not found for current user')
      : Success(deliusIds)

  const getDeliusId = (deliusIds: DeliusId[]): Result<DeliusId, string> =>
    deliusIds.length > 1 ? Fail('Multiple Delius usernames found for current user') : Success(deliusIds[0])

  const getOffendersForStaffCode = (token: string) => async (staffCode: string): Promise<{ hdcEligible: any[] }> => {
    const offenders = await roService.getROPrisoners(staffCode, token)
    const hdcEligible = offenders.filter(R.path(['sentenceDetail', 'homeDetentionCurfewEligibilityDate']))
    return { hdcEligible }
  }

  function neededForRole(prisoner, role) {
    const interestedStatuses = {
      RO: [
        { stage: 'PROCESSING_RO' },
        { stage: 'PROCESSING_CA' },
        { stage: 'APPROVAL' },
        { stage: 'DECIDED' },
        { stage: 'MODIFIED' },
        { stage: 'MODIFIED_APPROVAL' },
      ],
      DM: [
        { stage: 'PROCESSING_CA', status: 'Postponed' },
        { stage: 'APPROVAL' },
        { stage: 'DECIDED' },
        { stage: 'MODIFIED' },
        { stage: 'MODIFIED_APPROVAL' },
      ],
    }

    if (!interestedStatuses[role]) {
      return true
    }

    const includedStage = interestedStatuses[role].find((config) => prisoner.stage === config.stage)

    if (!includedStage) {
      return false
    }

    if (includedStage.status) {
      return includedStage.status === prisoner.status
    }

    return true
  }

  async function getHdcCaseList(token, username, role, tab = 'active') {
    try {
      const { hdcEligible, message } = await getCaseList(username, role, token)

      if (isEmpty(hdcEligible)) {
        logger.info('No hdc eligible prisoners')
        return { hdcEligible: [], message: message || 'No HDC cases' }
      }

      const formattedCaseList = await caseListFormatter.formatCaseList(hdcEligible, role)
      const formatted = formattedCaseList.filter(
        (prisoner) => neededForRole(prisoner, role) && prisoner.activeCase === (tab === 'active')
      )

      return { hdcEligible: formatted }
    } catch (error) {
      logger.error('Error during getHdcCaseList: ', error.stack)
      throw error
    }
  }

  return { getHdcCaseList }
}

/**
 * @template S, E
 * @typedef {import("../utils/ResultTypes").Result<S, E>} Result
 */
const R = require('ramda')
const { Success, Fail } = require('../utils/Result')
/**
 * @typedef {import("../services/roService").RoService} RoService
 * @typedef {import("../../types/delius").StaffDetails} StaffDetails
 */

/**
 * @typedef DeliusId
 * @property {string} staff_id
 */

const logger = require('../../log.js')
const { isEmpty } = require('../utils/functionalHelpers')

/**
 * @param {RoService} roService
 */
module.exports = function createCaseListService(nomisClientBuilder, roService, licenceClient, caseListFormatter) {
  async function getCaseList(username, role, token) {
    const asyncCaseRetrievalMethod = {
      CA: getCaDmCaseLists(token),
      RO: getROCaseList(username, token),
      DM: getCaDmCaseLists(token),
    }

    return asyncCaseRetrievalMethod[role]()
  }

  function getCaDmCaseLists(token) {
    return async () => {
      const hdcEligible = await nomisClientBuilder(token).getHdcEligiblePrisoners()
      return { hdcEligible }
    }
  }

  /**
   * Assume username is assigned to an RO.  Look up this user in the local db (staff_ids table) and take the staff code.
   * Alternatively if a unique staff code cannot be found in this db, ask Delius for a staff code.
   */
  const getROCaseList = (username, token) => async () => {
    const staffCodeFromDb = await getStaffCodeFromDb(username)
    const staffCode = await staffCodeFromDb.orElseTryAsync(() => getStaffCodeFromDelius(username))
    const offendersForStaffCode = await staffCode.mapAsync(getOffendersForStaffCode(token))
    return offendersForStaffCode.match(R.identity, message => ({ hdcEligible: [], message }))
  }

  /**
   * @param {string} username
   * @returns {Promise<Result<string, string>>}
   */
  const getStaffCodeFromDb = async username => {
    const deliusIds = await licenceClient.getDeliusUserName(username)

    return validateDeliusIds(deliusIds)
      .flatMap(getDeliusId)
      .map(id => id.staff_id.toUpperCase())
  }

  /**
   * @param {string} username
   * @returns {Promise<Result<string, string>>}
   */
  const getStaffCodeFromDelius = async username => {
    const staffDetailsResult = await getStaffDetailsFromDelius(username)

    return staffDetailsResult.flatMap(({ staffCode }) =>
      isEmpty(staffCode) ? Fail(`Delius did not supply a staff code for username ${username}`) : Success(staffCode)
    )
  }

  /**
   * @param {string} username
   * @returns {Promise<Result<StaffDetails, string>>}
   */
  const getStaffDetailsFromDelius = async username => {
    const staffDetails = await roService.getStaffByUsername(username)

    return isEmpty(staffDetails)
      ? Fail(`Staff details not found in Delius for username: ${username}`)
      : Success(staffDetails)
  }

  /**
   * @param {DeliusId[]} deliusIds
   * @returns {Result<DeliusId[], string>}
   */
  const validateDeliusIds = deliusIds =>
    !Array.isArray(deliusIds) || deliusIds.length < 1 || isEmpty(deliusIds[0].staff_id)
      ? Fail('Delius username not found for current user')
      : Success(deliusIds)

  /**
   * @param {DeliusId[]} deliusIds
   * @returns {Result<DeliusId, string>}
   */
  const getDeliusId = deliusIds =>
    deliusIds.length > 1 ? Fail('Multiple Delius usernames found for current user') : Success(deliusIds[0])

  /**
   * @type {(token: string) => (staffCode: string) => Promise<{hdcEligible : any[]}>}
   */
  const getOffendersForStaffCode = token => async staffCode => {
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
      DM: [{ stage: 'APPROVAL' }, { stage: 'DECIDED' }, { stage: 'PROCESSING_CA', status: 'Postponed' }],
    }

    if (!interestedStatuses[role]) {
      return true
    }

    const includedStage = interestedStatuses[role].find(config => prisoner.stage === config.stage)

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
        prisoner => neededForRole(prisoner, role) && prisoner.activeCase === (tab === 'active')
      )

      return { hdcEligible: formatted }
    } catch (error) {
      logger.error('Error during getHdcCaseList: ', error.stack)
      throw error
    }
  }

  return { getHdcCaseList }
}

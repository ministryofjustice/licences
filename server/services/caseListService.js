const R = require('ramda')
const Result = require('../utils/Result')
/**
 * @typedef {import("../services/roService").RoService} RoService
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
   *
   * The code below is an ( ugly bodge / elegant solution ) that breaks the type contract on Result.orElse():
   * staffCodeFromDB is a Result<string,string>, but getStaffCodeFromDelius() returns a Promise<Result<string,string>>
   * This means that the .orElse() will return either a Result<string,string> or a Promise<Result<string,string>>
   * Fortunately the 'await' prefix flattens nested Promises so that it all 'just works'.
   *
   */
  const getROCaseList = (username, token) => async () => {
    const staffCodeFromDb = await getStaffCodeFromDb(username)
    const staffCode = await staffCodeFromDb.orElse(() => getStaffCodeFromDelius(username))
    return staffCode.map(getOffendersForStaffCode(token)).match(R.identity, message => ({ hdcEligible: [], message }))
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
      isEmpty(staffCode)
        ? Result.Fail(`Delius did not supply a staff code for username ${username}`)
        : Result.Success(staffCode)
    )
  }

  const getStaffDetailsFromDelius = async username => {
    const staffDetails = await roService.getStaffByUsername(username)

    return isEmpty(staffDetails)
      ? Result.Fail(`Staff details not found in Delius for username: ${username}`)
      : Result.Success(staffDetails)
  }

  const validateDeliusIds = deliusIds =>
    !Array.isArray(deliusIds) || deliusIds.length < 1 || isEmpty(deliusIds[0].staff_id)
      ? Result.Fail('Delius username not found for current user')
      : Result.Success(deliusIds)

  const getDeliusId = deliusIds =>
    deliusIds.length > 1
      ? Result.Fail('Multiple Delius usernames found for current user')
      : Result.Success(deliusIds[0])

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

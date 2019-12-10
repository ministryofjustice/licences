/**
 * @typedef {import("../services/roService").RoService} RoService
 */
const logger = require('../../log.js')
const { isEmpty, getIn } = require('../utils/functionalHelpers')

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

  function getROCaseList(username, token) {
    return async () => {
      const deliusIds = await licenceClient.getDeliusUserName(username)

      if (!Array.isArray(deliusIds) || deliusIds.length < 1 || isEmpty(deliusIds[0].staff_id)) {
        logger.error(`No delius user ID for nomis ID '${username}'`)
        return {
          hdcEligible: [],
          message: 'Delius username not found for current user',
        }
      }

      if (deliusIds.length > 1) {
        logger.error(`Multiple delius user ID for nomis ID '${username}'`)
        return {
          hdcEligible: [],
          message: 'Multiple Delius usernames found for current user',
        }
      }

      const staffCode = deliusIds[0].staff_id.toUpperCase()

      const offenders = await roService.getROPrisoners(staffCode, token)

      if (!isEmpty(offenders)) {
        const hdcEligible = offenders.filter(prisoner =>
          getIn(prisoner, ['sentenceDetail', 'homeDetentionCurfewEligibilityDate'])
        )
        return { hdcEligible }
      }

      logger.warn(`No eligible releases found for RO user nomis ID: '${username}, using delius ID: ${staffCode}'`)
      return { hdcEligible: [] }
    }
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

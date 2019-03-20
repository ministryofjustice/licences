const logger = require('../../log.js')
const { getRoOverdueCasesDate, getRoDueCasesDates } = require('../utils/dueDates')

const roleStages = {
  RO: 'PROCESSING_RO',
}

const dueDateMethods = {
  RO: { due: getRoDueCasesDates, overdue: getRoOverdueCasesDate },
}

module.exports = function createDeadlineService(licenceClient) {
  async function getDueInDays(role, days) {
    rejectIfUnknown(role)
    const { from, upto } = dueDateMethods[role].due(days)
    try {
      return licenceClient.getLicencesInStageBetweenDates(roleStages[role], from, upto)
    } catch (error) {
      logger.error('Error getting due licences', error.stack)
      throw error
    }
  }

  async function getOverdue(role) {
    rejectIfUnknown(role)
    const upto = dueDateMethods[role].overdue()
    try {
      return licenceClient.getLicencesInStageBeforeDate(roleStages[role], upto)
    } catch (error) {
      logger.error('Error getting overdue licences', error.stack)
      throw error
    }
  }

  function rejectIfUnknown(role) {
    if (!roleStages[role] || !dueDateMethods[role]) {
      const message = `Unmatched role code for getting due dates: ${role}`
      logger.error()
      throw new Error(message)
    }
  }

  return { getDueInDays, getOverdue }
}

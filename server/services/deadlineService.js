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
    if (!Number.isInteger(days) || days < 0) {
      throw new Error('Days must be a whole number')
    }
    rejectIfUnknown(role)
    const { from, upto } = dueDateMethods[role].due(days)
    return licenceClient.getLicencesInStageBetweenDates(roleStages[role], from, upto)
  }

  async function getOverdue(role) {
    rejectIfUnknown(role)
    const upto = dueDateMethods[role].overdue()
    return licenceClient.getLicencesInStageBeforeDate(roleStages[role], upto)
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

const moment = require('moment-business-days')
const { dueDateFormat, roNewCaseWorkingDays, roNewCaseTodayCutOff } = require('../config').notifications

module.exports = {
  getRoCaseDueDate,
  getRoNewCaseDueDate,
  getRoOverdueCasesDate,
  getRoDueCasesDates,
}

const holidaysLocalName = 'holidaysLocale'

function getRoNewCaseDueDate() {
  return addRoWorkingDays(moment().locale(holidaysLocalName))
}

function getRoCaseDueDate(startMoment) {
  if (!moment.isMoment(startMoment)) {
    return null
  }

  return addRoWorkingDays(startMoment.locale(holidaysLocalName))
}

function addRoWorkingDays(startMoment) {
  const extraDaysAllowance = startMoment.hour() >= roNewCaseTodayCutOff ? 1 : 0
  return startMoment.businessAdd(roNewCaseWorkingDays + extraDaysAllowance).format(dueDateFormat)
}

function getRoOverdueCasesDate() {
  const now = moment().locale(holidaysLocalName)

  return now
    .businessSubtract(roNewCaseWorkingDays + 1)
    .hour(roNewCaseTodayCutOff - 1)
    .format('YYYY-MM-DD HH:59:59')
}

function getRoDueCasesDates(workingDaysUntilDue) {
  const now = moment().locale(holidaysLocalName)
  const workingDaysBefore = roNewCaseWorkingDays - workingDaysUntilDue

  return {
    upto: now
      .businessSubtract(workingDaysBefore)
      .hour(roNewCaseTodayCutOff - 1)
      .format('YYYY-MM-DD HH:59:59'),
    from: now
      .businessSubtract(workingDaysBefore + 1)
      .hour(roNewCaseTodayCutOff)
      .format('YYYY-MM-DD HH:00:00'),
  }
}

// Use a custom locale to avoid conflict with other customisations of the en locale eg caseListFormatter.js
const holidaysLocale = holidaysLocalName
moment.defineLocale(holidaysLocale, {
  parentLocale: 'en',
  holidays: [
    '19-04-2019',
    '22-04-2019',
    '06-05-2019',
    '27-05-2019',
    '26-08-2019',
    '25-12-2019',
    '26-12-2019',
    '01-01-2020',
    '10-04-2020',
    '13-04-2020',
    '04-05-2020',
    '25-05-2020',
    '31-08-2020',
    '25-12-2020',
    '28-12-2020',
  ],
  holidayFormat: 'DD-MM-YYYY',
})

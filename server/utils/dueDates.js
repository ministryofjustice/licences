const moment = require('moment-business-days')
const { dueDateFormat, roNewCaseWorkingDays, roNewCaseTodayCutOff } = require('../config').notificationConfig

module.exports = {
  getRoNewCaseDueDate,
}

function getRoNewCaseDueDate() {
  const now = moment().locale('en-holidays')
  const daysToAdd = now.hour() >= roNewCaseTodayCutOff ? roNewCaseWorkingDays + 1 : roNewCaseWorkingDays

  return now.businessAdd(daysToAdd).format(dueDateFormat)
}

// Use a custom locale to avoid conflict with other customisations of the en locale eg caseListFormatter.js
moment.defineLocale('en-holidays', {
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

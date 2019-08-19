const R = require('ramda')

const reportingDateFields = [
  {
    reportingDate: {
      splitDate: { day: 'reportingDay', month: 'reportingMonth', year: 'reportingYear' },
      responseType: 'requiredDate',
    },
  },
  {
    reportingTime: {
      responseType: 'requiredTime',
    },
  },
]

const reportingInstructionFields = [
  {
    name: {
      responseType: 'requiredString',
      validationMessage: 'Enter a name',
    },
  },
  {
    organisation: {
      responseType: 'requiredString',
      validationMessage: 'Enter a CRC/NPS organisation name',
    },
  },
  {
    buildingAndStreet1: {
      responseType: 'requiredString',
      validationMessage: 'Enter a building or street',
    },
  },
  {
    buildingAndStreet2: {
      responseType: 'optionalString',
    },
  },
  {
    townOrCity: {
      responseType: 'requiredString',
      validationMessage: 'Enter a town or city',
    },
  },
  {
    postcode: {
      responseType: 'requiredPostcode',
      validationMessage: 'Enter a postcode in the right format',
    },
  },
  {
    telephone: {
      responseType: 'requiredPhone',
    },
  },
]

const fieldName = R.compose(
  R.head,
  R.keys
)
const replacementFactory = field => ({ [fieldName(field)]: { responseType: 'optionalString' } })
const replaceResponseType = R.chain(R.mergeDeepLeft, replacementFactory)
const replaceResponseTypes = R.map(replaceResponseType)

module.exports = {
  reportingInstructions: {
    licenceSection: 'reportingInstructions',
    fields: R.concat(reportingInstructionFields, reportingDateFields),
    validate: false,
    noModify: true,
    nextPath: {
      path: '/hdc/taskList/',
      change: '/hdc/review/licenceDetails/',
    },
  },

  reportingDate: {
    licenceSection: 'reportingInstructions',
    saveSection: ['reporting', 'reportingInstructions'],
    fields: R.concat(replaceResponseTypes(reportingInstructionFields), reportingDateFields),
    validate: true,
    noModify: true,
    nextPath: {
      path: '/hdc/pdf/taskList/',
    },
  },
}

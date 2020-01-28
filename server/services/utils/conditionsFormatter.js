const { merge } = require('../../utils/functionalHelpers')

const ALWAYS_REQUIRED = ['additionalConditions', 'bookingId']

module.exports = { formatConditionsInput }

function formatConditionsInput(inputObject, selectedConditionsConfig) {
  const conditionsFieldsRequired = selectedConditionsConfig.reduce(getSelectedFieldNamesReducer, [])
  const inputObjectWithDates = combineDatesIn(conditionsFieldsRequired, inputObject)
  return filterInputs(inputObjectWithDates, conditionsFieldsRequired)
}

function filterInputs(inputObject, conditionsFieldsRequired) {
  return Object.keys(inputObject).reduce((filteredInput, fieldName) => {
    if (!ALWAYS_REQUIRED.includes(fieldName) && !conditionsFieldsRequired.includes(fieldName)) {
      return filteredInput
    }

    const fieldInput = inputObject[fieldName]

    return { ...filteredInput, [fieldName]: fieldInput }
  }, {})
}

function getSelectedFieldNamesReducer(array, condition) {
  if (!condition.field_position) {
    return array
  }
  const inputItems = Object.keys(condition.field_position).map(key => key)
  return [...array, ...inputItems]
}

function combineDatesIn(conditionsFieldsRequired, inputObject) {
  const DATE_FIELD = 'appointmentDate'
  const DATE_FIELD_IN_DRUGS_SECTION = 'appointmentDateInDrugsSection'

  if (
    !conditionsFieldsRequired.includes(DATE_FIELD) &&
    !conditionsFieldsRequired.includes(DATE_FIELD_IN_DRUGS_SECTION)
  ) {
    return inputObject
  }

  const [day, month, year] = ['appointmentDay', 'appointmentMonth', 'appointmentYear']
  const [dayInDrugsSection, monthInDrugsSection, yearInDrugsSection] = [
    'appointmentDayInDrugsSection',
    'appointmentMonthInDrugsSection',
    'appointmentYearInDrugsSection',
  ]
  return merge(inputObject, {
    [DATE_FIELD]: `${inputObject[day]}/${inputObject[month]}/${inputObject[year]}`,
    [DATE_FIELD_IN_DRUGS_SECTION]: `${inputObject[dayInDrugsSection]}/${inputObject[monthInDrugsSection]}/${
      inputObject[yearInDrugsSection]
    }`,
  })
}
